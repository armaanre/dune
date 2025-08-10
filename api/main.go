package main

import (
	"log"
	"os"

	"formbuilder/internal/db"
	"formbuilder/internal/handlers"
	"formbuilder/internal/realtime"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/contrib/websocket"
)

func main() {
	if err := db.Connect(); err != nil {
		log.Fatal(err)
	}

	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET,POST,PUT,OPTIONS",
	}))

	hub := realtime.NewHub()
	// Allow only websocket upgrades on /ws/* routes
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) { return c.Next() }
		return fiber.ErrUpgradeRequired
	})

	h := &handlers.FormsHandler{Hub: hub}
	h.Register(app)

	port := os.Getenv("PORT")
	if port == "" { port = "8080" }
	log.Println("API listening on", port)
	log.Fatal(app.Listen(":" + port))
}
