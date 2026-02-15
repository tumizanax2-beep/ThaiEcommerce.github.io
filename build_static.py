#!/usr/bin/env python3
"""
Build static HTML files from Flask app for GitHub Pages deployment
"""

from flask import Flask, render_template
import os
import shutil
from app import app, products

# Create Flask app for building
app.config['FREEZER_RELATIVE_URLS'] = True

def build_static():
    """Build static HTML files"""
    
    # Create dist directory
    if os.path.exists('dist'):
        shutil.rmtree('dist')
    os.makedirs('dist')
    
    # Copy static files
    if os.path.exists('static'):
        shutil.copytree('static', 'dist/static')
    
    # Generate HTML files
    with app.app_context():
        # Index page
        index_html = render_template('index.html', products=products)
        with open('dist/index.html', 'w', encoding='utf-8') as f:
            f.write(index_html)
        
        # Cart page
        cart_html = render_template('cart.html', cart_items=[], cart_total=0)
        with open('dist/cart.html', 'w', encoding='utf-8') as f:
            f.write(cart_html)
        
        # Order success page
        order_html = render_template('order_success.html')
        with open('dist/order_success.html', 'w', encoding='utf-8') as f:
            f.write(order_html)
    
    print("✅ Static files built successfully!")
    print("📁 Files in dist/:")
    for root, dirs, files in os.walk('dist'):
        level = root.replace('dist', '').count(os.sep)
        indent = ' ' * 2 * level
        print(f"{indent}{os.path.basename(root)}/")
        subindent = ' ' * 2 * (level + 1)
        for file in files:
            print(f"{subindent}{file}")

if __name__ == '__main__':
    build_static()
