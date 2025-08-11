package validate

import (
	"fmt"

	"formbuilder/internal/models"
)

type ValidationError struct {
	FieldId string `json:"fieldId"`
	Message string `json:"message"`
}

type ValidationResult struct {
	Valid  bool              `json:"valid"`
	Errors []ValidationError `json:"errors"`
}

func ValidateResponse(form models.Form, answers map[string]interface{}) ValidationResult {
	result := ValidationResult{Valid: true}

	fieldById := map[string]models.Field{}
	for _, f := range form.Fields {
		fieldById[f.Id] = f
	}

	for _, f := range form.Fields {
		value, exists := answers[f.Id]
		if f.Required && !exists {
			result.Valid = false
			result.Errors = append(result.Errors, ValidationError{FieldId: f.Id, Message: "field is required"})
			continue
		}
		if !exists {
			continue
		}
		switch f.Type {
		case models.FieldText:
			if _, ok := value.(string); !ok {
				result.Valid = false
				result.Errors = append(result.Errors, ValidationError{FieldId: f.Id, Message: "must be a string"})
			}
		case models.FieldMultipleChoice:
			v, ok := value.(string)
			if !ok {
				result.Valid = false
				result.Errors = append(result.Errors, ValidationError{FieldId: f.Id, Message: "must be a string option id"})
				break
			}
			valid := false
			for _, opt := range f.Options {
				if opt.Id == v {
					valid = true
					break
				}
			}
			if !valid {
				result.Valid = false
				result.Errors = append(result.Errors, ValidationError{FieldId: f.Id, Message: "invalid option"})
			}
		case models.FieldCheckbox:
			arr, ok := value.([]interface{})
			if !ok {
				result.Valid = false
				result.Errors = append(result.Errors, ValidationError{FieldId: f.Id, Message: "must be an array of option ids"})
				break
			}
			allowed := map[string]bool{}
			for _, opt := range f.Options {
				allowed[opt.Id] = true
			}
			for _, it := range arr {
				id, ok := it.(string)
				if !ok || !allowed[id] {
					result.Valid = false
					result.Errors = append(result.Errors, ValidationError{FieldId: f.Id, Message: fmt.Sprintf("invalid option %v", it)})
				}
			}
		case models.FieldRating:
			// accept float64 from JSON decoder
			var num float64
			switch vv := value.(type) {
			case float64:
				num = vv
			case int:
				num = float64(vv)
			default:
				result.Valid = false
				result.Errors = append(result.Errors, ValidationError{FieldId: f.Id, Message: "must be a number"})
				break
			}
			min := 1
			max := 5
			if f.MinRating > 0 {
				min = f.MinRating
			}
			if f.MaxRating > 0 {
				max = f.MaxRating
			}
			if int(num) < min || int(num) > max {
				result.Valid = false
				result.Errors = append(result.Errors, ValidationError{FieldId: f.Id, Message: fmt.Sprintf("must be between %d and %d", min, max)})
			}
		}
	}

	// Unknown fields check (optional)
	for id := range answers {
		if _, ok := fieldById[id]; !ok {
			// ignore unknown fields rather than failing hard
		}
	}

	return result
}
