package models

import "time"

type Enrollment struct {
	Id          int       `json:"id"`
	StudentId  int       `json:"student_id"`
	CourseId   int       `json:"course_id"`
	EnrolledAt time.Time `json:"enrolled_at"`
}
