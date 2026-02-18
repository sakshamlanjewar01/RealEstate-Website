import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from .models import Property


def train_model():
    properties = Property.objects.all()

    if properties.count() < 5:
        return None

    data = []

    for p in properties:
        data.append({
            "bedrooms": p.bedrooms,
            "bathrooms": p.bathrooms,
            "area": p.area,
            "location": p.location.lower(),
            "price": float(p.price)
        })

    df = pd.DataFrame(data)

    # Encode location (city)
    df = pd.get_dummies(df, columns=["location"])

    X = df.drop("price", axis=1)
    y = df["price"]

    model = RandomForestRegressor(
        n_estimators=100,
        random_state=42
    )

    model.fit(X, y)

    return model, X.columns


def predict_price(bedrooms, bathrooms, area, location):
    trained = train_model()

    if not trained:
        return None

    model, columns = trained

    # Prepare input
    input_data = {
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "area": area,
    }

    # Add location encoding
    for col in columns:
        if col.startswith("location_"):
            input_data[col] = 1 if col == f"location_{location.lower()}" else 0

    input_df = pd.DataFrame([input_data])

    # Ensure same column order
    input_df = input_df.reindex(columns=columns, fill_value=0)

    predicted = model.predict(input_df)

    return round(float(predicted[0]), 2)
