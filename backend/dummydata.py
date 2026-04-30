import json
import random
from datetime import datetime, timedelta

def random_date(days_back):
    return (datetime.utcnow() - timedelta(days=random.randint(1, days_back))).isoformat() + "Z"

suppliers = []
cities = ["London", "Manchester", "Birmingham", "Edinburgh", "Belfast", "Cardiff", "Glasgow"]
for i in range(1, 101):
    supplier_id = f"SUP-{i:03d}"
    suppliers.append({
        "supplier_id": supplier_id,
        "supplier_name": f"Enterprise Supplier {i} Ltd.",
        "email": f"contact@supplier{i}.co.uk",
        "phone": f"+44 7700 900{random.randint(100, 999)}",
        "reliability_score": random.randint(70, 100),
        "address": {
            "street": f"{random.randint(1, 200)} Industrial Way",
            "city": random.choice(cities),
            "postcode": f"{random.choice(['E', 'M', 'B', 'EH', 'BT', 'CF', 'G'])}{random.randint(1, 20)} 1AB",
            "country": "UK"
        },
        "performance_reviews": [
            {"date": random_date(365), "rating": random.randint(3, 5), "comment": "Good overall service."},
            {"date": random_date(100), "rating": random.randint(4, 5), "comment": "Delivery was prompt."}
        ]
    })

with open('suppliers.json', 'w') as f:
    json.dump(suppliers, f, indent=2)
print("Created suppliers.json with 100 records!")

inventory = []
categories = ["Electronics", "Furniture", "Stationery", "IT Equipment", "Office Supplies"]
materials_list = [["plastic", "metal"], ["wood", "steel"], ["recycled paper"], ["aluminum", "glass"], ["mesh", "nylon"]]

for i in range(1, 101):
    item_category = random.choice(categories)
    assigned_supplier = random.choice(suppliers)["supplier_id"] if random.random() > 0.1 else "Unassigned"
    
    inventory.append({
        "item_id": f"INV-{i:04d}", 
        "item_name": f"Corporate {item_category} Product {i}",
        "category": item_category,
        "quantity_in_stock": random.randint(0, 200),
        "reorder_level": random.randint(10, 50),
        "supplier_id": assigned_supplier,
        "unit_price": round(random.uniform(5.0, 500.0), 2),
        "last_updated": random_date(30),
        "specifications": {
            "weight_kg": round(random.uniform(0.1, 30.0), 2),
            "dimensions_cm": {
                "length": random.randint(10, 150),
                "width": random.randint(10, 100),
                "height": random.randint(2, 200)
            },
            "materials": random.choice(materials_list)
        },
        "restock_history": [
            {"date": random_date(180), "quantity_added": random.randint(20, 100)},
            {"date": random_date(60), "quantity_added": random.randint(10, 50)}
        ]
    })

with open('inventory.json', 'w') as f:
    json.dump(inventory, f, indent=2)
print("Created inventory.json with 100 records!")