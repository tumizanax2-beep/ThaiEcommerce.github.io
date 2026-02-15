function updateCartCount() {
    fetch('/cart')
        .then(response => response.text())
        .then(html => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            const cartItems = tempDiv.querySelectorAll('.cart-item');
            const count = Array.from(cartItems).reduce((total, item) => {
                const quantity = item.querySelector('.quantity-input');
                return total + (quantity ? parseInt(quantity.value) : 0);
            }, 0);
            
            const cartCountElement = document.getElementById('cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = count;
                cartCountElement.style.display = count > 0 ? 'flex' : 'none';
            }
        })
        .catch(error => console.error('Error updating cart count:', error));
}
document.addEventListener('DOMContentLoaded', function() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.productId;
            const productName = this.dataset.productName;
            
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="loading"></span> กำลังเพิ่ม...';
            this.disabled = true;
            
            fetch('/add_to_cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: parseInt(productId),
                    quantity: 1
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updateCartCount();
        
                    showToast('เพิ่ม "' + productName + '" ลงตะกร้าเรียบร้อยแล้ว');
                    
                    this.innerHTML = '✓ เพิ่มแล้ว';
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.disabled = false;
                    }, 1000);
                } else {
                    showToast('เกิดข้อผิดพลาด: ' + (data.error || 'ไม่สามารถเพิ่มสินค้าได้'), 'error');
                    this.innerHTML = originalText;
                    this.disabled = false;
                }
            })
            .catch(error => {
                console.error('Error adding to cart:', error);
                showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
                this.innerHTML = originalText;
                this.disabled = false;
            });
        });
    });
    
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

function showToast(message, type = 'success') {
    const toastEl = document.getElementById('cart-toast');
    const toastBody = toastEl.querySelector('.toast-body');
    const toastHeader = toastEl.querySelector('.toast-header');
 
    toastBody.textContent = message;
    
    toastHeader.className = 'toast-header';
    const icon = toastHeader.querySelector('i');
    
    if (type === 'error') {
        toastHeader.classList.add('bg-danger', 'text-white');
        icon.textContent = '⚠️';
    } else {
        toastHeader.classList.add('bg-success', 'text-white');
        icon.textContent = '✓';
    }
    
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

function formatPrice(price) {
    return '฿' + price.toLocaleString('th-TH');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

function showLoading(element) {
    element.style.opacity = '0.5';
    element.style.pointerEvents = 'none';
}

function hideLoading(element) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
}

function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

const NumberUtils = {
    format: function(num) {
        return num.toLocaleString('th-TH');
    },
    
    currency: function(num) {
        return '฿' + this.format(num);
    },
    
    parse: function(str) {
        return parseInt(str.replace(/[^\d]/g, '')) || 0;
    }
};

const CartUtils = {
    updateTotal: function() {
        let subtotal = 0;
        document.querySelectorAll('.cart-item').forEach(item => {
            const price = NumberUtils.parse(item.querySelector('.text-center .h5').textContent);
            const quantity = NumberUtils.parse(item.querySelector('.quantity-input').value);
            subtotal += price * quantity;
        });
        
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        
        if (subtotalElement) subtotalElement.textContent = NumberUtils.currency(subtotal);
        if (totalElement) totalElement.textContent = NumberUtils.currency(subtotal);
    },
    
    validateQuantity: function(input) {
        const value = parseInt(input.value);
        if (isNaN(value) || value < 1) {
            input.value = 1;
        } else if (value > 99) {
            input.value = 99;
        }
    }
};

const FormValidator = {
    required: function(field) {
        return field.value.trim() !== '';
    },
    
    email: function(field) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(field.value);
    },
    
    phone: function(field) {
        const phoneRegex = /^0[0-9]{9}$/;
        return phoneRegex.test(field.value.replace(/[-\s]/g, ''));
    },
    
    number: function(field, min = 0, max = Infinity) {
        const num = parseInt(field.value);
        return !isNaN(num) && num >= min && num <= max;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.btn, .card').forEach(element => {
        element.style.transition = 'all 0.3s ease';
    });
    
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

window.CartUtils = CartUtils;
window.NumberUtils = NumberUtils;
window.FormValidator = FormValidator;
window.showToast = showToast;
window.updateCartCount = updateCartCount;
