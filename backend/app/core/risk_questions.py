"""
Static question bank for the 12-question risk assessment
('Question 3 of 12' screen). Each option carries a point value used
to compute the final risk_score (max 26, matching the FINDRISC scale
referenced in the proposal).
"""

RISK_QUESTIONS = [
    {
        "id": "q1",
        "order": 1,
        "prompt": "Do you often feel unusual thirst or dry mouth, even after drinking water?",
        "options": [
            {"value": "yes_frequently", "label": "Yes, frequently (daily or more)", "points": 3},
            {"value": "sometimes", "label": "Sometimes (2-3 times a week)", "points": 2},
            {"value": "rarely", "label": "Rarely", "points": 1},
            {"value": "no", "label": "No, not at all", "points": 0},
        ],
    },
    {
        "id": "q2",
        "order": 2,
        "prompt": "Do you urinate more frequently than usual, especially at night?",
        "options": [
            {"value": "yes_frequently", "label": "Yes, frequently (daily or more)", "points": 3},
            {"value": "sometimes", "label": "Sometimes (2-3 times a week)", "points": 2},
            {"value": "rarely", "label": "Rarely", "points": 1},
            {"value": "no", "label": "No, not at all", "points": 0},
        ],
    },
    {
        "id": "q3",
        "order": 3,
        "prompt": "Do you often feel unusually tired or fatigued during the day?",
        "options": [
            {"value": "yes_frequently", "label": "Yes, frequently (daily or more)", "points": 3},
            {"value": "sometimes", "label": "Sometimes (2-3 times a week)", "points": 2},
            {"value": "rarely", "label": "Rarely", "points": 1},
            {"value": "no", "label": "No, not at all", "points": 0},
        ],
    },
    {
        "id": "q4",
        "order": 4,
        "prompt": "Have you noticed blurred vision recently?",
        "options": [
            {"value": "yes_frequently", "label": "Yes, frequently", "points": 2},
            {"value": "sometimes", "label": "Sometimes", "points": 1},
            {"value": "no", "label": "No", "points": 0},
        ],
    },
    {
        "id": "q5",
        "order": 5,
        "prompt": "Do cuts or bruises take longer than usual to heal?",
        "options": [
            {"value": "yes", "label": "Yes", "points": 2},
            {"value": "sometimes", "label": "Sometimes", "points": 1},
            {"value": "no", "label": "No", "points": 0},
        ],
    },
    {
        "id": "q6",
        "order": 6,
        "prompt": "Do you eat vegetables, fruits or berries every day?",
        "options": [
            {"value": "yes", "label": "Yes, every day", "points": 0},
            {"value": "no", "label": "No, not every day", "points": 1},
        ],
    },
    {
        "id": "q7",
        "order": 7,
        "prompt": "Do you exercise for at least 30 minutes most days of the week?",
        "options": [
            {"value": "yes", "label": "Yes, most days", "points": 0},
            {"value": "no", "label": "No, rarely or never", "points": 2},
        ],
    },
    {
        "id": "q8",
        "order": 8,
        "prompt": "Have you ever been told you have high blood pressure?",
        "options": [
            {"value": "yes", "label": "Yes", "points": 2},
            {"value": "no", "label": "No", "points": 0},
        ],
    },
    {
        "id": "q9",
        "order": 9,
        "prompt": "Have you ever been found to have high blood glucose (e.g. in a health check-up)?",
        "options": [
            {"value": "yes", "label": "Yes", "points": 5},
            {"value": "no", "label": "No", "points": 0},
        ],
    },
    {
        "id": "q10",
        "order": 10,
        "prompt": "Do you experience frequent hunger, even shortly after eating?",
        "options": [
            {"value": "yes_frequently", "label": "Yes, frequently", "points": 2},
            {"value": "sometimes", "label": "Sometimes", "points": 1},
            {"value": "no", "label": "No", "points": 0},
        ],
    },
    {
        "id": "q11",
        "order": 11,
        "prompt": "Do you experience numbness or tingling in your hands or feet?",
        "options": [
            {"value": "yes", "label": "Yes", "points": 2},
            {"value": "no", "label": "No", "points": 0},
        ],
    },
    {
        "id": "q12",
        "order": 12,
        "prompt": "Has anyone in your immediate family been diagnosed with diabetes?",
        "options": [
            {"value": "yes_parent_sibling", "label": "Yes, a parent or sibling", "points": 5},
            {"value": "yes_grandparent", "label": "Yes, a grandparent/aunt/uncle", "points": 3},
            {"value": "no", "label": "No", "points": 0},
        ],
    },
]

QUESTIONS_BY_ID = {q["id"]: q for q in RISK_QUESTIONS}
