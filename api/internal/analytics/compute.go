package analytics

import (
	"context"
	"sort"

	"formbuilder/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type FieldDistribution struct {
	FieldId string                 `json:"fieldId"`
	Type    models.FieldType       `json:"type"`
	Label   string                 `json:"label"`
	Counts  map[string]int         `json:"counts,omitempty"`
	Average float64                `json:"average,omitempty"`
	Count   int                    `json:"count"`
	RecentTexts []string           `json:"recentTexts,omitempty"`
}

type Analytics struct {
	FormId  string              `json:"formId"`
	Fields  []FieldDistribution `json:"fields"`
	TotalResponses int          `json:"totalResponses"`
}

func Compute(ctx context.Context, db *mongo.Database, form models.Form) (Analytics, error) {
	responsesColl := db.Collection("responses")

	cur, err := responsesColl.Find(ctx, bson.M{"formId": form.Id})
	if err != nil {
		return Analytics{}, err
	}
	defer cur.Close(ctx)

	var responses []models.Response
	if err := cur.All(ctx, &responses); err != nil {
		return Analytics{}, err
	}

	fieldIndex := map[string]models.Field{}
	for _, f := range form.Fields {
		fieldIndex[f.Id] = f
	}

	dists := []FieldDistribution{}
	for _, f := range form.Fields {
		fd := FieldDistribution{FieldId: f.Id, Type: f.Type, Label: f.Label}
		switch f.Type {
		case models.FieldMultipleChoice, models.FieldCheckbox:
			counts := map[string]int{}
			labelById := map[string]string{}
			for _, opt := range f.Options {
				counts[opt.Label] = 0
				labelById[opt.Id] = opt.Label
			}
			for _, r := range responses {
				ans, ok := r.Answers[f.Id]
				if !ok {
					continue
				}
				if f.Type == models.FieldMultipleChoice {
					if s, ok := ans.(string); ok {
						if label, ok := labelById[s]; ok { counts[label]++ }
					}
				} else {
					if arr, ok := ans.([]interface{}); ok {
						for _, it := range arr {
							if s, ok := it.(string); ok {
								if label, ok := labelById[s]; ok { counts[label]++ }
							}
						}
					}
				}
			}
			fd.Counts = counts
			fd.Count = len(responses)
		case models.FieldRating:
			var sum float64
			var cnt int
			for _, r := range responses {
				ans, ok := r.Answers[f.Id]
				if !ok {
					continue
				}
				switch v := ans.(type) {
				case float64:
					sum += v
					cnt++
				case int32:
					sum += float64(v)
					cnt++
				case int64:
					sum += float64(v)
					cnt++
				case int:
					sum += float64(v)
					cnt++
				}
			}
			fd.Count = cnt
			if cnt > 0 {
				fd.Average = sum / float64(cnt)
			}
		case models.FieldText:
			var texts []string
			for _, r := range responses {
				ans, ok := r.Answers[f.Id]
				if s, ok2 := ans.(string); ok && ok2 {
					texts = append(texts, s)
				}
			}
			// limit to most recent 10 by CreatedAt
			sort.SliceStable(responses, func(i, j int) bool { return responses[i].CreatedAt > responses[j].CreatedAt })
			var recent []string
			for _, r := range responses {
				if s, ok := r.Answers[f.Id].(string); ok {
					recent = append(recent, s)
					if len(recent) == 10 { break }
				}
			}
			fd.RecentTexts = recent
			fd.Count = len(texts)
		}
		dists = append(dists, fd)
	}

	return Analytics{FormId: form.Id.Hex(), Fields: dists, TotalResponses: len(responses)}, nil
}

func MustObjectID(id string) primitive.ObjectID {
	ox, _ := primitive.ObjectIDFromHex(id)
	return ox
}
