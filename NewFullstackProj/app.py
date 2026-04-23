from flask import Flask
from flask_cors import CORS
from routes.inventory_routes import inventory_bp
from routes.supplier_routes import supplier_bp

app = Flask(__name__)

CORS(app, origins=['http://localhost:4200'], 
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization', 'X-Role'])

# Register Blueprints
app.register_blueprint(inventory_bp, url_prefix="/api")
app.register_blueprint(supplier_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True, port=5001)