/* Cold Blooded Hearts: The Den - Main Interactions */

document.addEventListener('DOMContentLoaded', () => {
    console.log('The Den Initialized.');

    // --- State Management ---
    let cart = JSON.parse(localStorage.getItem('den_cart')) || [];

    // Simple Data Migration: Ensure all items use 'product' instead of 'name'
    // This fixes issues if old test data (name) is still in the browser.
    let migrated = false;
    cart = cart.map(item => {
        if (item.name && !item.product) {
            item.product = item.name;
            delete item.name;
            migrated = true;
        }
        return item;
    });
    if (migrated) localStorage.setItem('den_cart', JSON.stringify(cart));

    // --- Elements ---
    const cartBtn = document.getElementById('cart-btn');

    // Initialize EmailJS with Public Key
    if (typeof emailjs !== 'undefined') {
        emailjs.init("tjFiVTG59iT5vLlQm");
    }
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCart = document.getElementById('close-cart');
    const cartItemsList = document.getElementById('cart-items-list');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartCountVal = document.getElementById('cart-count-val');

    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeCheckout = document.getElementById('close-checkout');
    const checkoutSummaryList = document.getElementById('checkout-summary-list');
    const checkoutGrandTotal = document.getElementById('checkout-grand-total');
    const paymentMethods = document.querySelectorAll('.payment-method-item');
    const paymentDetailsArea = document.getElementById('payment-details-area');
    const completePurchaseBtn = document.getElementById('complete-purchase-btn');
    const checkoutStatus = document.getElementById('checkout-status');

    // --- Cart Functions ---

    function saveCart() {
        localStorage.setItem('den_cart', JSON.stringify(cart));
        updateUI();
    }

    function updateUI() {
        // Update Cart Count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountVal.innerText = totalItems;

        // Populate Cart Drawer
        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p style="text-align: center; color: var(--color-text-muted); margin-top: 2rem;">Your cart is empty.</p>';
            cartSubtotal.innerText = '$0.00';
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.disabled = true;
        } else {
            cartItemsList.innerHTML = '';
            let total = 0;
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-img">IMG</div>
                    <div class="cart-item-details">
                        <div class="cart-item-header">
                            <span class="cart-item-title">${item.product}</span>
                            <span class="remove-item" data-index="${index}" style="cursor: pointer; color: var(--color-red-ekg); font-size: 0.8rem;">Remove</span>
                        </div>
                        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                        <div class="cart-item-qty-row">
                            <div class="quantity-selector">
                                <button class="qty-btn minus-cart" data-index="${index}">-</button>
                                <span class="qty-val" style="width: 20px; text-align: center;">${item.quantity}</span>
                                <button class="qty-btn plus-cart" data-index="${index}">+</button>
                            </div>
                        </div>
                    </div>
                `;
                cartItemsList.appendChild(itemEl);
            });
            cartSubtotal.innerText = `$${total.toFixed(2)}`;
            checkoutBtn.style.opacity = '1';
            checkoutBtn.disabled = false;
        }
    }

    function addToCart(id, product, price, quantity) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ id, product, price, quantity });
        }
        saveCart();
        openCart();
    }

    function openCart() {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
    }

    function closeCartDrawer() {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
    }

    // --- Checkout Logic ---

    function openCheckout() {
        if (cart.length === 0) return;
        closeCartDrawer();
        checkoutModal.style.display = 'block';
        updateCheckoutSummary();
    }

    function updateCheckoutSummary() {
        checkoutSummaryList.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            const summaryRow = document.createElement('div');
            summaryRow.className = 'checkout-summary-item';
            summaryRow.innerHTML = `
                <span>${item.product} x ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            checkoutSummaryList.appendChild(summaryRow);
        });
        checkoutGrandTotal.innerText = `$${total.toFixed(2)}`;
    }

    // --- Event Listeners ---

    // Mobile Menu
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Cart Toggles
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCart) closeCart.addEventListener('click', closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

    // Add to Cart Buttons (Shop Page)
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const product = btn.getAttribute('data-product');
            const price = parseFloat(btn.getAttribute('data-price'));
            const qtyInput = btn.closest('.product-card').querySelector('.qty-input');
            const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

            console.log(`Add to Cart Clicked: ${product} (ID: ${id}) x${quantity} @ $${price}`);
            addToCart(id, product, price, quantity);
        });
    });

    // Quantity Selectors (Product Cards)
    document.querySelectorAll('.product-card .quantity-selector').forEach(selector => {
        const minus = selector.querySelector('.minus');
        const plus = selector.querySelector('.plus');
        const input = selector.querySelector('.qty-input');

        if (minus && input) {
            minus.addEventListener('click', () => {
                if (input.value > 1) input.value = parseInt(input.value) - 1;
            });
        }
        if (plus && input) {
            plus.addEventListener('click', () => {
                input.value = parseInt(input.value) + 1;
            });
        }
    });

    // Cart Drawer Interaction (Delegation)
    cartItemsList.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        if (e.target.classList.contains('remove-item')) {
            cart.splice(index, 1);
            saveCart();
        } else if (e.target.classList.contains('minus-cart')) {
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
                saveCart();
            }
        } else if (e.target.classList.contains('plus-cart')) {
            cart[index].quantity++;
            saveCart();
        }
    });

    // Checkout Modal
    if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckout);
    if (closeCheckout) closeCheckout.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
    });

    // Payment Method Selection
    paymentMethods.forEach(item => {
        item.addEventListener('click', () => {
            paymentMethods.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const method = item.getAttribute('data-method');

            if (method === 'etransfer') {
                paymentDetailsArea.innerHTML = `
                    <div class="form-row">
                        <label>Confirm Email for Instructions</label>
                        <input type="email" id="checkout-email" placeholder="email@example.com" required>
                    </div>
                `;
            } else if (method === 'paypal') {
                paymentDetailsArea.innerHTML = `
                    <div class="form-row">
                        <label>Confirm Your Email</label>
                        <input type="email" id="checkout-email" placeholder="email@example.com" required>
                    </div>
                    <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-top: 1rem;">
                        You will be redirected to PayPal to complete your payment securely.
                    </p>
                `;
            } else if (method === 'card') {
                paymentDetailsArea.innerHTML = `
                    <div class="form-row">
                        <label>Confirm Your Email</label>
                        <input type="email" id="checkout-email" placeholder="email@example.com" required>
                    </div>
                    <div class="form-row">
                        <label>Cardholder Name</label>
                        <input type="text" placeholder="Full Name">
                    </div>
                    <div class="form-row">
                        <label>Card Details</label>
                        <input type="text" placeholder="XXXX XXXX XXXX XXXX">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-row">
                            <label>Expiration</label>
                            <input type="text" placeholder="MM/YY">
                        </div>
                        <div class="form-row">
                            <label>CVV</label>
                            <input type="text" placeholder="***">
                        </div>
                    </div>
                `;
            }
        });
    });

    // Complete Purchase
    if (completePurchaseBtn) {
        completePurchaseBtn.addEventListener('click', async () => {
            const emailInput = document.getElementById('checkout-email');
            const email = emailInput ? emailInput.value : '';

            if (!email || !email.includes('@')) {
                checkoutStatus.innerHTML = '<span style="color: var(--color-red-ekg);">Please enter a valid email for confirmation.</span>';
                return;
            }

            const activeMethod = document.querySelector('.payment-method-item.active').getAttribute('data-method');
            checkoutStatus.innerHTML = '<span style="color: var(--color-teal);">Processing Order...</span>';
            completePurchaseBtn.disabled = true;
            completePurchaseBtn.style.opacity = '0.5';

            // Prepare Order Data for Formspree
            const orderDetails = cart.map(item => `${item.product} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`).join('\n');
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

            const formData = new FormData();
            formData.append('email', email);
            formData.append('subject', `NEW ORDER: ${activeMethod.toUpperCase()}`);
            formData.append('order_details', orderDetails);
            formData.append('total_amount', `$${total}`);
            formData.append('payment_method', activeMethod);
            formData.append('_replyto', email); // For site owner to reply

            try {
                // 1. Send Order Dossier to Site Owner (Formspree)
                const response = await fetch('https://formspree.io/f/mjggezoe', {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    // 2. Send Branded Receipt to Customer (EmailJS)
                    try {
                        await sendCustomerReceipt(email, activeMethod.toUpperCase(), orderDetails, total);
                    } catch (e) {
                        console.warn('Customer receipt could not be sent automatically. If this is a 400 error on your live site, please verify your EmailJS Template/Service IDs.', e);
                    }

                    showSuccessState(activeMethod, email);
                    cart = [];
                    saveCart();
                } else {
                    checkoutStatus.innerHTML = '<span style="color: var(--color-red-ekg);">Oops! System error. Please contact us directly.</span>';
                    completePurchaseBtn.disabled = false;
                    completePurchaseBtn.style.opacity = '1';
                }
            } catch (error) {
                checkoutStatus.innerHTML = '<span style="color: var(--color-red-ekg);">Network error. Please check your connection.</span>';
                completePurchaseBtn.disabled = false;
                completePurchaseBtn.style.opacity = '1';
            }
        });
    }

    // --- Notifications (Free Customer Confirmation via EmailJS) ---
    async function sendCustomerReceipt(customerEmail, paymentMethod, orderDetails, total) {
        if (typeof emailjs === 'undefined') {
            console.error('EmailJS SDK not loaded.');
            return;
        }

        const templateParams = {
            to_email: customerEmail,
            payment_method: paymentMethod,
            order_details: orderDetails,
            total_amount: `$${total}`,
            reply_to: 'support@coldbloodedhearts.com'
        };

        console.log('Attempting to send EmailJS receipt...', templateParams);

        try {
            // Using the 4-parameter version of send for maximum reliability in SDK v4
            const result = await emailjs.send('service_jshwbap', 'template_2qp1iid', templateParams, 'tjFiVTG59iT5vLlQm');
            console.log('EmailJS SUCCESS!', result.status, result.text);
            return result;
        } catch (error) {
            console.error('EmailJS FAILED to send. Error details:', error);
            // If the error has a response text or status, EmailJS usually provides it here
            if (error.text) console.error('EmailJS Error Text:', error.text);
            throw error; // Propagate error for the main flow to handle
        }
    }

    function showSuccessState(method, email) {
        const checkoutMain = document.querySelector('.checkout-main');
        let methodMsg = '';

        if (method === 'etransfer') {
            methodMsg = `<p style="margin-bottom: 2rem;">Instructions have been sent to <strong>${email}</strong>. Please complete the transfer to finalize your order.</p>`;
        } else if (method === 'paypal') {
            methodMsg = `<p style="margin-bottom: 2rem;">A confirmation email has been sent to <strong>${email}</strong>. (PayPal Redirect Mockup)</p>`;
        } else {
            methodMsg = `<p style="margin-bottom: 2rem;">A confirmation email has been sent to <strong>${email}</strong>. (Stripe Mockup)</p>`;
        }

        checkoutMain.innerHTML = `
            <div style="text-align: center; padding: 2rem 0;">
                <div style="width: 80px; height: 80px; background: var(--color-neon-green); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; box-shadow: 0 0 20px var(--color-neon-glow);">
                    <svg viewBox="0 0 24 24" style="width: 40px; height: 40px; fill: var(--color-bg);">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                </div>
                <h2 class="serif-text" style="font-size: 2.5rem; margin-bottom: 1rem;">Order Received!</h2>
                ${methodMsg}
                <button class="btn btn-primary" onclick="window.location.reload()" style="width: 100%;">Return to Den</button>
            </div>
        `;
    }

    // Initial UI Sync
    updateUI();

    // Form Status Handle (Legacy/Contact)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const status = document.getElementById('form-status');
            const data = new FormData(e.target);
            status.innerHTML = '<span style="color: var(--color-teal);">Sending...</span>';
            try {
                const response = await fetch(e.target.action, {
                    method: contactForm.method,
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    status.innerHTML = '<span style="color: var(--color-neon-green);">Inquiry sent! We will get back to you soon.</span>';
                    contactForm.reset();
                } else {
                    status.innerHTML = '<span style="color: var(--color-red-ekg);">Oops! There was a problem.</span>';
                }
            } catch (error) {
                status.innerHTML = '<span style="color: var(--color-red-ekg);">Submission error.</span>';
            }
        });
    }
});
