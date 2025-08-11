package handlers

import (
	"context"
	"strconv"
	"time"

	"formbuilder/internal/analytics"
	"formbuilder/internal/db"
	"formbuilder/internal/models"
	"formbuilder/internal/realtime"
	"formbuilder/internal/validate"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type FormsHandler struct {
	Hub *realtime.Hub
}

func (h *FormsHandler) Register(app *fiber.App) {
	api := app.Group("/api")
	api.Get("/forms", h.listForms)
	api.Get("/health", func(c *fiber.Ctx) error { return c.SendString("ok") })
	api.Post("/forms", h.createForm)
	api.Get("/forms/:id", h.getForm)
	api.Put("/forms/:id", h.updateForm)
	api.Post("/forms/:id/responses", h.submitResponse)
	api.Get("/forms/:id/analytics", h.getAnalytics)
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello World")
	})
	app.Get("/ws/forms/:id", websocket.New(h.wsForm))
}

func (h *FormsHandler) listForms(c *fiber.Ctx) error {
	limit := int64(50)
	if s := c.Query("limit"); s != "" {
		if n, err := strconv.Atoi(s); err == nil && n > 0 && n <= 200 {
			limit = int64(n)
		}
	}
	cur, err := db.FormsCollection().Find(c.Context(), bson.M{}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(limit))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	defer cur.Close(c.Context())
	var forms []models.Form
	if err := cur.All(c.Context(), &forms); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(forms)
}

func (h *FormsHandler) createForm(c *fiber.Ctx) error {
	var form models.Form
	if err := c.BodyParser(&form); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	now := time.Now().Unix()
	form.Id = primitive.NilObjectID
	form.CreatedAt = now
	form.UpdatedAt = now
	res, err := db.FormsCollection().InsertOne(c.Context(), form)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	form.Id = res.InsertedID.(primitive.ObjectID)
	return c.Status(fiber.StatusCreated).JSON(form)
}

func (h *FormsHandler) getForm(c *fiber.Ctx) error {
	id := c.Params("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	var form models.Form
	err = db.FormsCollection().FindOne(c.Context(), bson.M{"_id": oid}).Decode(&form)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "not found")
	}
	return c.JSON(form)
}

func (h *FormsHandler) updateForm(c *fiber.Ctx) error {
	id := c.Params("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	var form models.Form
	if err := c.BodyParser(&form); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	form.UpdatedAt = time.Now().Unix()
	_, err = db.FormsCollection().UpdateByID(c.Context(), oid, bson.M{"$set": bson.M{
		"title":     form.Title,
		"fields":    form.Fields,
		"updatedAt": form.UpdatedAt,
	}})
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	form.Id = oid
	return c.JSON(form)
}

func (h *FormsHandler) submitResponse(c *fiber.Ctx) error {
	id := c.Params("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}

	var form models.Form
	if err := db.FormsCollection().FindOne(c.Context(), bson.M{"_id": oid}).Decode(&form); err != nil {
		return fiber.NewError(fiber.StatusNotFound, "form not found")
	}
	var payload struct {
		Answers map[string]interface{} `json:"answers"`
	}
	if err := c.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	vr := validate.ValidateResponse(form, payload.Answers)
	if !vr.Valid {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(vr)
	}
	resp := models.Response{FormId: oid, Answers: payload.Answers, CreatedAt: time.Now().Unix()}
	_, err = db.ResponsesCollection().InsertOne(c.Context(), resp)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	analyticsData, err := analytics.Compute(ctx, db.FormsCollection().Database(), form)
	if err == nil {
		h.Hub.Broadcast(id, analyticsData)
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"ok": true})
}

func (h *FormsHandler) getAnalytics(c *fiber.Ctx) error {
	id := c.Params("id")
	oid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	var form models.Form
	if err := db.FormsCollection().FindOne(c.Context(), bson.M{"_id": oid}).Decode(&form); err != nil {
		return fiber.NewError(fiber.StatusNotFound, "form not found")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	data, err := analytics.Compute(ctx, db.FormsCollection().Database(), form)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(data)
}

func (h *FormsHandler) wsForm(c *websocket.Conn) {
	formId := c.Params("id")
	h.Hub.Add(formId, c)
	defer func() {
		h.Hub.Remove(formId, c)
		c.Close()
	}()
	for {
		if _, _, err := c.ReadMessage(); err != nil {
			break
		}
	}
}
