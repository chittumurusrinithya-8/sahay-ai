import pandas as pd
import torch
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from transformers import (
    BertTokenizer,
    BertForSequenceClassification,
    Trainer,
    TrainingArguments,
    EarlyStoppingCallback
)
from datasets import Dataset
import pickle
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

# =========================================
# 1️⃣ LOAD DATASET
# =========================================

df = pd.read_csv("dataset.csv")

print("Dataset Loaded Successfully")
print(df.head())

# =========================================
# 2️⃣ ENCODE LABELS
# =========================================

label_encoder = LabelEncoder()
df["label"] = label_encoder.fit_transform(df["Department"])

num_labels = len(label_encoder.classes_)
print("Number of Departments:", num_labels)

# Save encoder
with open("label_encoder.pkl", "wb") as f:
    pickle.dump(label_encoder, f)

# =========================================
# 3️⃣ TRAIN TEST SPLIT (STRATIFIED)
# =========================================

train_texts, val_texts, train_labels, val_labels = train_test_split(
    df["Complaint_Text"],
    df["label"],
    test_size=0.2,
    random_state=42,
    stratify=df["label"]
)

# =========================================
# 4️⃣ TOKENIZATION
# =========================================

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

train_encodings = tokenizer(
    list(train_texts),
    truncation=True,
    padding=True,
    max_length=128
)

val_encodings = tokenizer(
    list(val_texts),
    truncation=True,
    padding=True,
    max_length=128
)

train_dataset = Dataset.from_dict({
    **train_encodings,
    "labels": train_labels.tolist()
})

val_dataset = Dataset.from_dict({
    **val_encodings,
    "labels": val_labels.tolist()
})

train_dataset.set_format("torch")
val_dataset.set_format("torch")

# =========================================
# 5️⃣ LOAD MODEL
# =========================================

model = BertForSequenceClassification.from_pretrained(
    "bert-base-uncased",
    num_labels=num_labels
)

# =========================================
# 6️⃣ METRICS
# =========================================

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=1)

    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, predictions, average='weighted'
    )
    acc = accuracy_score(labels, predictions)

    return {
        "accuracy": acc,
        "f1": f1,
        "precision": precision,
        "recall": recall
    }

# =========================================
# 7️⃣ TRAINING CONFIG (FIXED FOR V5)
# =========================================

training_args = TrainingArguments(
    output_dir="./results",

    num_train_epochs=6,

    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,

    eval_strategy="epoch",        # ✅ FIXED (v5)
    save_strategy="epoch",

    logging_dir="./logs",
    logging_steps=10,

    learning_rate=2e-5,
    weight_decay=0.01,
    warmup_steps=50,

    load_best_model_at_end=True,
    metric_for_best_model="f1",

    save_total_limit=2,
)

# =========================================
# 8️⃣ TRAINER
# =========================================

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    compute_metrics=compute_metrics,
    callbacks=[EarlyStoppingCallback(early_stopping_patience=2)]
)

# =========================================
# 9️⃣ TRAIN MODEL
# =========================================

print("Starting Training...")
trainer.train()

# =========================================
# 🔟 SAVE MODEL
# =========================================

model.save_pretrained("bert_department_model")
tokenizer.save_pretrained("bert_department_model")

print("✅ Model training completed and saved successfully!")