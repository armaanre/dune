package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type FieldType string

const (
	FieldText           FieldType = "text"
	FieldMultipleChoice FieldType = "multiple_choice"
	FieldCheckbox       FieldType = "checkbox"
	FieldRating         FieldType = "rating"
)

type FieldOption struct {
	Id    string `json:"id" bson:"id"`
	Label string `json:"label" bson:"label"`
}

type Field struct {
	Id          string      `json:"id" bson:"id"`
	Type        FieldType   `json:"type" bson:"type"`
	Label       string      `json:"label" bson:"label"`
	Required    bool        `json:"required" bson:"required"`
	Placeholder string      `json:"placeholder,omitempty" bson:"placeholder,omitempty"`
	Options     []FieldOption `json:"options,omitempty" bson:"options,omitempty"`
	MinRating   int         `json:"minRating,omitempty" bson:"minRating,omitempty"`
	MaxRating   int         `json:"maxRating,omitempty" bson:"maxRating,omitempty"`
}

type Form struct {
	Id        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Title     string             `json:"title" bson:"title"`
	Fields    []Field            `json:"fields" bson:"fields"`
	CreatedAt int64              `json:"createdAt" bson:"createdAt"`
	UpdatedAt int64              `json:"updatedAt" bson:"updatedAt"`
}
