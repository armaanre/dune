package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Response struct {
	Id        primitive.ObjectID     `json:"id" bson:"_id,omitempty"`
	FormId    primitive.ObjectID     `json:"formId" bson:"formId"`
	Answers   map[string]interface{} `json:"answers" bson:"answers"`
	CreatedAt int64                  `json:"createdAt" bson:"createdAt"`
}
