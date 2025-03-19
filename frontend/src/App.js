import { useEffect, useState } from "react";
import "./App.css";

function Section({ title, children }) {
  return (
    <div className="section">
      <h1 className="section-title">{title}</h1>
      {children}
    </div>
  );
}

function StudentCard({ student, courses, enrollments, onEdit, onDelete }) {
  const studentCourses = enrollments
    .filter((e) => e.student_id === student.id)
    .map((e) => courses.find((c) => c.id === e.course_id));

  return (
    <div className="student-card">
      <div className="student-info">
        <div className="student-id">ID: {student.id}</div>
        <h3>{student.name}</h3>
        <p className="student-email">{student.email}</p>
      </div>

      {studentCourses.length > 0 ? (
        <div className="courses-list">
          <p className="courses-title">Курсы:</p>
          <ul>
            {studentCourses.map((c) => (
              <li key={c?.id}>{c?.title || "Неизвестный курс"}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="empty-courses">
          <span>🎯 Нет записей на курсы</span>
        </div>
      )}

      <div className="card-actions">
        <button className="edit-button" onClick={() => onEdit(student)}>
          ✏️ Редактировать
        </button>
        <button className="delete-button" onClick={() => onDelete(student.id)}>
          🗑️ Удалить
        </button>
      </div>
    </div>
  );
}

function CourseCard({ course, onDelete }) {
  return (
    <div className="course-card">
      <div className="course-id">ID: {course.id}</div>
      <h3>{course.title}</h3>
      <p>{course.description || "Описание отсутствует"}</p>
      <div className="card-actions">
        <button className="delete-button" onClick={() => onDelete(course.id)}>
          🗑️ Удалить
        </button>
      </div>
    </div>
  );
}

function EditForm({ student, onSave, onCancel }) {
  const [formData, setFormData] = useState(student);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Введите имя";
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Некорректный email";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors);
    onSave(formData);
  };

  return (
    <form className="edit-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            setErrors({ ...errors, name: "" });
          }}
          className={`form-input ${errors.name ? "error" : ""}`}
          placeholder="Имя"
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>
      
      <div className="input-group">
        <input
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            setErrors({ ...errors, email: "" });
          }}
          className={`form-input ${errors.email ? "error" : ""}`}
          placeholder="Email"
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-buttons">
        <button type="submit" className="save-button">
          💾 Сохранить
        </button>
        <button type="button" onClick={onCancel} className="cancel-button">
          ❌ Отмена
        </button>
      </div>
    </form>
  );
}

function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <p>{message}</p>
    </div>
  );
}

function Notification({ type, message, onClose }) {
  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  );
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const [newStudent, setNewStudent] = useState({ name: "", email: "" });
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const [newEnrollment, setNewEnrollment] = useState({ student_id: "", course_id: "" });
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
          fetch("http://localhost:8080/students"),
          fetch("http://localhost:8080/courses"),
          fetch("http://localhost:8080/enrollments")
        ]);

        const studentsData = await studentsRes.json();
        const coursesData = await coursesRes.json();
        const enrollmentsData = await enrollmentsRes.json();

        setStudents(studentsData);
        setCourses(coursesData);
        setEnrollments(enrollmentsData);
      } catch (err) {
        setNotification({ type: "error", message: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateStudent = async (updatedStudent) => {
    try {
      const res = await fetch(`http://localhost:8080/students/${updatedStudent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent)
      });

      setStudents(students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
      setEditingStudent(null);
      setNotification({ type: "success", message: "Студент обновлен" });
    } catch (error) {
      setNotification({ type: "error", message: error.message });
    }
  };

  const handleDelete = async (type, id) => {
    try {
      await fetch(`http://localhost:8080/${type}/${id}`, { method: "DELETE" });
      
      switch(type) {
        case 'students': setStudents(students.filter(s => s.id !== id)); break;
        case 'courses': setCourses(courses.filter(c => c.id !== id)); break;
        case 'enrollments': setEnrollments(enrollments.filter(e => e.id !== id)); break;
      }
      
      setNotification({ type: "success", message: "Удаление прошло успешно" });
    } catch (error) {
      setNotification({ type: "error", message: error.message });
    }
  };

  const addEntity = async (type, data) => {
    try {
      let payload = data;
      
      if (type === 'enrollments') {
        payload = {
          student_id: Number(data.student_id),
          course_id: Number(data.course_id)
        };
        
        const studentExists = students.some(s => s.id === payload.student_id);
        const courseExists = courses.some(c => c.id === payload.course_id);
        
        if (!studentExists || !courseExists) {
          throw new Error("Студент или курс не существуют");
        }
      }

      const res = await fetch(`http://localhost:8080/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Ошибка сервера");
      }

      const newData = await res.json();
      switch(type) {
        case 'students': setStudents([...students, newData]); break;
        case 'courses': setCourses([...courses, newData]); break;
        case 'enrollments': setEnrollments([...enrollments, newData]); break;
      }
      
      setNotification({ type: "success", message: "Добавление прошло успешно" });
    } catch (error) {
      setNotification({ 
        type: "error", 
        message: error.message || "Ошибка при выполнении операции"
      });
    }
  };

  if (loading) return <div className="loading">🌀 Загрузка...</div>;

  return (
    <div className="app-container">
      <h1 className="app-header">Учебный портал</h1>
      
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <Section title="Студенты">
        <div className="students-grid">
          {students.length === 0 ? (
            <EmptyState message="Нет зарегистрированных студентов" />
          ) : (
            students.map((student) =>
              editingStudent?.id === student.id ? (
                <EditForm
                  key={student.id}
                  student={student}
                  onSave={handleUpdateStudent}
                  onCancel={() => setEditingStudent(null)}
                />
              ) : (
                <StudentCard
                  key={student.id}
                  student={student}
                  courses={courses}
                  enrollments={enrollments}
                  onEdit={setEditingStudent}
                  onDelete={(id) => handleDelete("students", id)}
                />
              )
            )
          )}
        </div>
        
        <div className="add-form">
          <h2>Добавить студента</h2>
          <input
            type="text"
            placeholder="Имя"
            value={newStudent.name}
            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            className="form-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={newStudent.email}
            onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
            className="form-input"
          />
          <button className="add-button" onClick={() => addEntity("students", newStudent)}>
            ➕ Добавить студента
          </button>
        </div>
      </Section>

      <Section title="Курсы">
        <div className="courses-grid">
          {courses.length === 0 ? (
            <EmptyState message="Нет доступных курсов" />
          ) : (
            courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onDelete={(id) => handleDelete("courses", id)}
              />
            ))
          )}
        </div>
        
        <div className="add-form">
          <h2>Добавить курс</h2>
          <input
            type="text"
            placeholder="Название"
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            className="form-input"
          />
          <input
            type="text"
            placeholder="Описание"
            value={newCourse.description}
            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            className="form-input"
          />
          <button className="add-button" onClick={() => addEntity("courses", newCourse)}>
            ➕ Добавить курс
          </button>
        </div>
      </Section>

      <Section title="Записи">
        <div className="add-form">
          <h2>Новая запись</h2>
          <input
            type="number"
            placeholder="ID студента"
            value={newEnrollment.student_id}
            onChange={(e) => setNewEnrollment({ 
              ...newEnrollment, 
              student_id: e.target.value.replace(/[^0-9]/g, "") 
            })}
            className="form-input"
            min="1"
          />
          <input
            type="number"
            placeholder="ID курса"
            value={newEnrollment.course_id}
            onChange={(e) => setNewEnrollment({ 
              ...newEnrollment, 
              course_id: e.target.value.replace(/[^0-9]/g, "") 
            })}
            className="form-input"
            min="1"
          />
          <button className="add-button" onClick={() => addEntity("enrollments", newEnrollment)}>
            ➕ Добавить запись
          </button>
        </div>
        
        <div className="enrollments-list">
          {enrollments.length === 0 ? (
            <EmptyState message="Нет активных записей" />
          ) : (
            enrollments.map((e) => {
              const student = students.find((s) => s.id === e.student_id);
              const course = courses.find((c) => c.id === e.course_id);
              return (
                <div key={e.id} className="enrollment-item">
                  <span className="enrollment-student">
                    {student?.name || "Неизвестный студент"} (ID: {e.student_id})
                  </span>
                  <span className="enrollment-course">
                    {course?.title || "Неизвестный курс"} (ID: {e.course_id})
                  </span>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete("enrollments", e.id)}
                  >
                    🗑️ Удалить
                  </button>
                </div>
              );
            })
          )}
        </div>
      </Section>
    </div>
  );
}