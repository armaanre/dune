package handlers

import (
	"formbuilder/internal/realtime"

	"github.com/gofiber/fiber/v2"
)

type FormsHandler struct {
	Hub *realtime.Hub
}

func (h *FormsHandler) Register(app *fiber.App) {
	api := app.Group("/api")
	api.Get("/health", func(c *fiber.Ctx) error { return c.SendString("ok") })
	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello World")
	})
}
