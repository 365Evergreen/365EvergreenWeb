---

# **📘 User Stories for Form Blocks**

*Form, Field Types, Layout Options, Validation, Submission, Advanced Behavior*

---

# **1. Form Block (Container)**

*The parent block that holds all fields, layout groups, and submission settings.*

---

## **1.1 — Insert a Form Block**

**As a** content editor  
**I want** to insert a Form block  
**So that** I can collect user input on my page

**Acceptance Criteria**

- Form block inserts an empty form container.
- JSON stores:
  - `fields: []`
  - `layout: "stack"`
  - `submitAction` (email, webhook, SWA API, redirect)
  - `validationMode` (inline, summary)
- Canvas shows a placeholder: “Add fields to your form”.

---

## **1.2 — Add Fields to the Form**

**As a** content editor  
**I want** to add field blocks inside the Form  
**So that** I can collect structured data

**Acceptance Criteria**

- Only field blocks can be inserted inside a Form.
- Drag-and-drop reorders fields.
- Deleting a field removes it from the JSON schema.
- Form block updates its internal schema automatically.

---

## **1.3 — Configure Submission Behavior**

**As a** content editor  
**I want** to choose how the form submits  
**So that** I can control where the data goes

**Acceptance Criteria**

- Submission options:
  - Email notification
  - Webhook (POST JSON)
  - SWA API endpoint
  - Save to storage (optional)
  - Redirect to URL
  - Show success message
- JSON stores:
  - `submitAction.type`
  - `submitAction.config`
- Canvas preview shows a mock success state.

---

## **1.4 — Configure Validation Behavior**

**As a** content editor  
**I want** to choose how validation errors appear  
**So that** the form is user-friendly

**Acceptance Criteria**

- Validation modes:
  - Inline (under each field)
  - Summary (top of form)
  - Both
- JSON stores: `validationMode`.
- Canvas shows validation preview.

---

---

# **2. Layout Options for Forms**

*Controls for arranging fields visually.*

---

## **2.1 — Choose Form Layout**

**As a** content editor  
**I want** to choose between stack, row, and grid layouts  
**So that** the form matches the page design

**Acceptance Criteria**

- Layout options:
  - Stack (default)
  - Two-column
  - Three-column
  - Custom grid (define columns)
- JSON stores: `layout.type` and `layout.columns`.
- Canvas updates instantly.

---

## **2.2 — Group Fields Visually**

**As a** content editor  
**I want** to group fields into sections  
**So that** long forms are easier to understand

**Acceptance Criteria**

- Supports Group, Row, and Columns blocks inside Form.
- Groups can have titles and descriptions.
- JSON stores nested structure.

---

## **2.3 — Multi-Step Form Layout**

**As a** content editor  
**I want** to break the form into steps  
**So that** users complete it more easily

**Acceptance Criteria**

- Step navigation: Next, Back, Submit.
- Each step is a Group block with `stepIndex`.
- JSON stores:
  - `steps: [{ id, title, fields: [...] }]`
- Canvas shows step indicators.

---

---

# **3. Field Blocks (All Types)**

*Each field is its own block with its own schema, validation, and UI.*

---

# **3.1 — Text Input Field**

*Single-line text field.*

### **User Story**

**As a** content editor  
**I want** to add a text input field  
**So that** users can enter short text

### **Acceptance Criteria**

- Properties:
  - Label
  - Placeholder
  - Required toggle
  - Min/max length
  - Pattern (regex)
- JSON stores:
  - `type: "text"`
  - `name`
  - `validation`
- Canvas shows live preview.

---

# **3.2 — Textarea Field**

*Multi-line text field.*

### **User Story**

**As a** content editor  
**I want** to add a textarea  
**So that** users can enter longer text

### **Acceptance Criteria**

- Properties:
  - Rows
  - Placeholder
  - Required
  - Character limit
- JSON stores: `type: "textarea"`.

---

# **3.3 — Email Field**

### **User Story**

**As a** content editor  
**I want** to add an email field  
**So that** I can collect valid email addresses

### **Acceptance Criteria**

- Built-in email validation.
- Required toggle.
- JSON stores: `type: "email"`.

---

# **3.4 — Phone Field**

### **User Story**

**As a** content editor  
**I want** to add a phone field  
**So that** I can collect valid phone numbers

### **Acceptance Criteria**

- Supports formatting masks.
- Supports country code dropdown.
- JSON stores: `type: "phone"`.

---

# **3.5 — Number Field**

### **User Story**

**As a** content editor  
**I want** to add a number field  
**So that** users can enter numeric values

### **Acceptance Criteria**

- Min/max
- Step
- Required
- JSON stores: `type: "number"`.

---

# **3.6 — Select Dropdown**

### **User Story**

**As a** content editor  
**I want** to add a dropdown  
**So that** users can choose from predefined options

### **Acceptance Criteria**

- Options list (label + value).
- Supports default selection.
- JSON stores: `options: []`.

---

# **3.7 — Radio Group**

### **User Story**

**As a** content editor  
**I want** to add radio buttons  
**So that** users can choose one option

### **Acceptance Criteria**

- Options list.
- Required toggle.
- JSON stores: `type: "radio"`.

---

# **3.8 — Checkbox**

### **User Story**

**As a** content editor  
**I want** to add a checkbox  
**So that** users can confirm or agree to something

### **Acceptance Criteria**

- Label
- Required toggle
- JSON stores: `type: "checkbox"`.

---

# **3.9 — Checkbox Group**

### **User Story**

**As a** content editor  
**I want** to add multiple checkboxes  
**So that** users can select multiple options

### **Acceptance Criteria**

- Options list
- Min/max selections
- JSON stores: `type: "checkbox-group"`.

---

# **3.10 — Date Field**

### **User Story**

**As a** content editor  
**I want** to add a date picker  
**So that** users can select a date

### **Acceptance Criteria**

- Min/max date
- Required
- JSON stores: `type: "date"`.

---

# **3.11 — File Upload Field**

### **User Story**

**As a** content editor  
**I want** to allow users to upload files  
**So that** I can collect documents or images

### **Acceptance Criteria**

- Allowed file types
- Max file size
- Single or multiple files
- JSON stores: `type: "file"`.

---

# **3.12 — Hidden Field**

### **User Story**

**As a** developer  
**I want** to add hidden fields  
**So that** I can pass metadata or tracking values

### **Acceptance Criteria**

- Name + value
- JSON stores: `type: "hidden"`.

---

---

# **4. Validation Stories**

*Validation is defined per field and enforced at form level.*

---

## **4.1 — Required Fields**

**As a** content editor  
**I want** to mark fields as required  
**So that** users must complete them

**Acceptance Criteria**

- Required toggle in properties panel.
- Inline error message appears on submit.
- JSON stores: `validation.required = true`.

---

## **4.2 — Pattern Validation**

**As a** developer  
**I want** to define regex patterns  
**So that** fields accept only valid input

**Acceptance Criteria**

- Pattern input field.
- Custom error message.
- JSON stores: `validation.pattern`.

---

## **4.3 — Cross-Field Validation**

**As a** developer  
**I want** to validate fields against each other  
**So that** I can enforce rules like “confirm email”

**Acceptance Criteria**

- Supported rules:
  - Match
  - Not match
  - Greater than / less than
- JSON stores: `validation.crossField`.

---

---

# **5. Advanced Form Behavior**

*Optional but powerful enhancements.*

---

## **5.1 — Conditional Logic**

**As a** content editor  
**I want** to show or hide fields based on user input  
**So that** the form adapts dynamically

**Acceptance Criteria**

- Conditions based on:
  - Field value
  - Checkbox state
  - Dropdown selection
- JSON stores:
  - `conditions: [{ field, operator, value, action }]`.

---

## **5.2 — Auto-Populate Fields**

**As a** developer  
**I want** to prefill fields from query params or user profile  
**So that** forms are easier to complete

**Acceptance Criteria**

- Supported sources:
  - URL query
  - Local storage
  - API response
- JSON stores: `prefill.source`.

---

## **5.3 — Success Redirect or Message**

**As a** content editor  
**I want** to choose what happens after submission  
**So that** users get clear feedback

**Acceptance Criteria**

- Options:
  - Redirect to URL
  - Show success message
  - Replace form with custom block
- JSON stores: `submitAction.success`.

---


