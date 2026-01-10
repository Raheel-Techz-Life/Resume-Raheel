# Section 2: Datasets Used

## Overview
We utilized three datasets provided by UIDAI covering Aadhaar enrolment and update activities.

## Dataset 1: Aadhaar Enrolment Data

### Description
Records of new Aadhaar enrolments across India.

### Records
~1,000,000 records

### Columns
| Column | Data Type | Description |
|--------|-----------|-------------|
| `date` | Date | Date of enrolment (DD-MM-YYYY) |
| `state` | String | State name |
| `district` | String | District name |
| `pincode` | Integer | PIN code |
| `age_0_5` | Integer | Enrolments for age 0-5 years |
| `age_5_17` | Integer | Enrolments for age 5-17 years |
| `age_18_greater` | Integer | Enrolments for age 18+ years |

---

## Dataset 2: Demographic Update Data

### Description
Records of demographic information updates (name, address, etc.).

### Records
~2,000,000 records

### Columns
| Column | Data Type | Description |
|--------|-----------|-------------|
| `date` | Date | Date of update (DD-MM-YYYY) |
| `state` | String | State name |
| `district` | String | District name |
| `pincode` | Integer | PIN code |
| `demo_age_5_17` | Integer | Updates for age 5-17 years |
| `demo_age_17_` | Integer | Updates for age 17+ years |

---

## Dataset 3: Biometric Update Data

### Description
Records of biometric data updates (fingerprints, iris, photo).

### Records
~1,800,000 records

### Columns
| Column | Data Type | Description |
|--------|-----------|-------------|
| `date` | Date | Date of update (DD-MM-YYYY) |
| `state` | String | State name |
| `district` | String | District name |
| `pincode` | Integer | PIN code |
| `bio_age_5_17` | Integer | Updates for age 5-17 years |
| `bio_age_17_` | Integer | Updates for age 17+ years |

---

## Data Source
All datasets provided by UIDAI through the official hackathon data portal.

---
*For PDF Section 2*
