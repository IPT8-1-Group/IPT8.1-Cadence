## Entitäten mit Attributen & PK/FK

### User

| Attribute     | Datentyp    | Schlüsseltyp |
| ------------- | ----------- | ------------ |
| id            | int         | PK           |
| email         | varchar(50) | UQ           |
| password hash | char(64)    | -            |
| role          | varchar(20) | -            |

---

### Token

| Attribute  | Datentyp | Schlüsseltyp |
| ---------- | -------- | ------------ |
| id         | int      | PK           |
| fk_user_id | int      | FK           |
| update     | bool     | -            |

---

### Module

| Attribute | Datentyp     | Schlüsseltyp |
| --------- | ------------ | ------------ |
| id        | int          | PK           |
| desc      | varchar(255) | -            |

---

### Course

| Attribute    | Datentyp     | Schlüsseltyp |
| ------------ | ------------ | ------------ |
| id           | int          | PK           |
| desc         | varchar(255) | -            |
| fk_module_id | int          | FK           |

---

### Course_day

| Attribute    | Datentyp | Schlüsseltyp |
| ------------ | -------- | ------------ |
| id           | int      | PK           |
| date         | DateTime | -            |
| fk_course_id | int      | FK           |

---

### Class

| Attribute    | Datentyp     | Schlüsseltyp |
| ------------ | ------------ | ------------ |
| id           | int          | PK           |
| desc         | varchar(255) | -            |
| fk_course_id | int          | FK           |

---
