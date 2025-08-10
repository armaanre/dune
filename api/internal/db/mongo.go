package db

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var client *mongo.Client
var database *mongo.Database

func Connect() error {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	c, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURI))
	if err != nil {
		return err
	}
	if err := c.Ping(ctx, nil); err != nil {
		return err
	}
	client = c
	dbName := os.Getenv("MONGO_DB")
	if dbName == "" {
		dbName = "formbuilder"
	}
	database = client.Database(dbName)
	log.Println("Connected to MongoDB:", mongoURI, "db:", dbName)
	return nil
}

func FormsCollection() *mongo.Collection {
	return database.Collection("forms")
}

func ResponsesCollection() *mongo.Collection {
	return database.Collection("responses")
}
