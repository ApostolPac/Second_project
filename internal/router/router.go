package router

import (
	"laba3/internal/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRouters(r *gin.Engine) {

	r.GET("/students", handlers.GetStudentsHandler)
	r.GET("/courses", handlers.GetCoursesHandler)
	r.GET("/enrollments", handlers.GetEnrollments)

	r.POST("/students", handlers.CreateStudentHandler)
	r.POST("/courses", handlers.CreateCourseHandler)
	r.POST("/enrollments", handlers.CreateEnrollmentHandler)

	r.PUT("/students/:id", handlers.UpdateStudentHandler)
	r.PUT("/courses/:id", handlers.UpdateCourseHandler)
	r.PUT("/enrollments/:id", handlers.UpdateEnrollmentHandler)

}
