from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import uuid
import os

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

products = [
    {
        'id': 1,
        'name': 'iPhone 15 Pro',
        'price': 39900,
        'description': 'iPhone 15 Pro พร้อมชิป A17 Pro และไทเทเนียม',
        'image': 'https://via.placeholder.com/300x300/007AFF/FFFFFF?text=iPhone+15+Pro',
        'category': 'smartphone'
    },
    {
        'id': 2,
        'name': 'Samsung Galaxy S24',
        'price': 28900,
        'description': 'Samsung Galaxy S24 กล้อง AI สุดล้ำ',
        'image': 'https://via.placeholder.com/300x300/1f77b4/FFFFFF?text=Galaxy+S24',
        'category': 'smartphone'
    },
    {
        'id': 3,
        'name': 'MacBook Air M2',
        'price': 45900,
        'description': 'MacBook Air พร้อมชิป M2 บางเบาและทรงพลัง',
        'image': 'https://via.placeholder.com/300x300/555555/FFFFFF?text=MacBook+Air',
        'category': 'laptop'
    },
    {
        'id': 4,
        'name': 'iPad Pro 12.9"',
        'price': 32900,
        'description': 'iPad Pro พร้อมชิป M2 และจอ Liquid Retina XDR',
        'image': 'https://via.placeholder.com/300x300/FF6B6B/FFFFFF?text=iPad+Pro',
        'category': 'tablet'
    },
    {
        'id': 5,
        'name': 'AirPods Pro 2',
        'price': 8990,
        'description': 'AirPods Pro พร้อมเสียงรบกวน Active Noise Cancellation',
        'image': 'https://via.placeholder.com/300x300/4ECDC4/FFFFFF?text=AirPods+Pro',
        'category': 'audio'
    },
    {
        'id': 6,
        'name': 'Apple Watch Series 9',
        'price': 14900,
        'description': 'Apple Watch Series 9 พร้อมเซ็นเซอร์สุขภาพ',
        'image': 'https://via.placeholder.com/300x300/FF6B35/FFFFFF?text=Apple+Watch',
        'category': 'watch'
    }
]

@app.route('/')
def index():
    return render_template('index.html', products=products)

@app.route('/cart')
def cart():
    cart_items = session.get('cart', [])
    cart_total = 0
    for item in cart_items:
        cart_total += item['price'] * item['quantity']
    return render_template('cart.html', cart_items=cart_items, cart_total=cart_total)

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    product_id = int(request.json.get('product_id'))
    quantity = int(request.json.get('quantity', 1))
    
    product = next((p for p in products if p['id'] == product_id), None)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    cart = session.get('cart', [])
    
    existing_item = next((item for item in cart if item['id'] == product_id), None)
    if existing_item:
        existing_item['quantity'] += quantity
    else:
        cart.append({
            'id': product['id'],
            'name': product['name'],
            'price': product['price'],
            'image': product['image'],
            'quantity': quantity
        })
    
    session['cart'] = cart
    
    cart_total = sum(item['price'] * item['quantity'] for item in cart)
    cart_count = sum(item['quantity'] for item in cart)
    
    return jsonify({
        'success': True,
        'cart_total': cart_total,
        'cart_count': cart_count
    })

@app.route('/update_cart', methods=['POST'])
def update_cart():
    product_id = int(request.json.get('product_id'))
    quantity = int(request.json.get('quantity'))
    
    cart = session.get('cart', [])
    
    if quantity == 0:
        cart = [item for item in cart if item['id'] != product_id]
    else:
        existing_item = next((item for item in cart if item['id'] == product_id), None)
        if existing_item:
            existing_item['quantity'] = quantity
    
    session['cart'] = cart
    
    cart_total = sum(item['price'] * item['quantity'] for item in cart)
    cart_count = sum(item['quantity'] for item in cart)
    
    return jsonify({
        'success': True,
        'cart_total': cart_total,
        'cart_count': cart_count
    })

@app.route('/checkout', methods=['POST'])
def checkout():
    print("Checkout endpoint called")
    try:
        session['cart'] = []
        order_id = str(uuid.uuid4())[:8].upper()
        print(f"Order created: {order_id}")
        return jsonify({
            'success': True,
            'order_id': order_id
        })
    except Exception as e:
        print(f"Checkout error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/order_success')
def order_success():
    return render_template('order_success.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
