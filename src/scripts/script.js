document.addEventListener('DOMContentLoaded', () => {
    const productCategories = {
        privileges: [
            { name: 'VIP', price: { 30: '50.0 ₽', 90: '120.0 ₽', forever: '250.0 ₽' } },
            { name: 'Premium', price: { 30: '100.0 ₽', 90: '250.0 ₽', forever: '500.0 ₽' } },
            { name: 'Elite', price: { 30: '200.0 ₽', 90: '500.0 ₽', forever: '1000.0 ₽' } },
            { name: 'Legend', price: { 30: '300.0 ₽', 90: '750.0 ₽', forever: '1500.0 ₽' } }
        ],
        cases: [
            { name: 'Обычный кейс', price: '50.0 ₽' },
            { name: 'Редкий кейс', price: '150.0 ₽' },
            { name: 'Легендарный кейс', price: '300.0 ₽' },
            { name: 'Кейс с питомцами', price: '200.0 ₽' }
        ],
        currency: [
            { name: 'Монеты', price: '10.0 ₽', unit: 'монета' }
        ],
        balance: [
            { name: 'Баланс', price: '25.0 ₽', unit: 'баланс' }
        ],
        other: [
            { name: 'Разблокировка чата', price: '50.0 ₽' },
            { name: 'Разблокировка аккаунта', price: '100.0 ₽' },
        ]
    };

    const promoCodes = {
        'WELCOME': { discount: 10, type: 'percent', description: 'Скидка 10% на первую покупку' },
        'HAPPY2024': { discount: 15, type: 'percent', description: 'Скидка 15% на все товары' },
        'NEWYEAR': { discount: 100, type: 'fixed', description: 'Скидка 100 ₽' },
        'VIP2024': { discount: 20, type: 'percent', description: 'Скидка 20% на все товары' }
    };

    const recentPurchases = [
        { username: 'Player1', item: 'VIP', time: '2 мин. назад' },
        { username: 'Player2', item: 'Premium', time: '5 мин. назад' },
        { username: 'Player3', item: 'Elite', time: '10 мин. назад' }
    ];

    const purchaseBtn = document.querySelector('.purchase-btn');
    const nicknameInput = document.querySelector('.nickname-input input');
    const emailInput = document.getElementById('email');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const periodSelect = document.getElementById('period-select');
    const casesCountInput = document.querySelector('.cases-count-input');
    const periodOptions = document.querySelectorAll('.period-option');
    const selectBtn = document.querySelector('.select-btn');
    const serverList = document.querySelector('.server-list');
    const serverPrice = selectBtn.querySelector('.server-price');
    
    let currentCategory = 'privileges';
    let currentPeriod = '30';
    let selectedProduct = null;
    let appliedPromoCode = null;
    let isNicknameValid = false;
    let isEmailValid = false;

    const casesCountInputElement = document.getElementById('casesCount');
    const minusBtn = document.querySelector('.minus-btn');
    const plusBtn = document.querySelector('.plus-btn');

    if (minusBtn && plusBtn && casesCountInputElement) {
        minusBtn.addEventListener('click', () => {
            const currentValue = parseInt(casesCountInputElement.value) || 1;
            if (currentValue > 1) {
                casesCountInputElement.value = currentValue - 1;
                updatePaymentButtonForQuantity();
            }
        });

        plusBtn.addEventListener('click', () => {
            const currentValue = parseInt(casesCountInputElement.value) || 1;
            const maxValue = parseInt(casesCountInputElement.max) || 999999;
            if (currentValue < maxValue) {
                casesCountInputElement.value = currentValue + 1;
                updatePaymentButtonForQuantity();
            }
        });

        casesCountInputElement.addEventListener('input', () => {
            let value = parseInt(casesCountInputElement.value) || 1;
            const maxValue = parseInt(casesCountInputElement.max) || 999999;
            
            if (value < 1) {
                value = 1;
            }
            
            if (value > maxValue) {
                value = maxValue;
            }
            
            casesCountInputElement.value = value;
            updatePaymentButtonForQuantity(); 
        });
    }

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
        
            categoryTabs.forEach(t => t.classList.remove('active'));
            

            tab.classList.add('active');
            

            currentCategory = tab.dataset.category;
            

            if (currentCategory === 'privileges') {
                periodSelect.classList.add('visible');
            } else {
                periodSelect.classList.remove('visible');
            }
    

             if (currentCategory === 'cases' || currentCategory === 'currency' || currentCategory === 'balance') {
                 casesCountInput.style.display = 'block';
                 

                 const quantityLabel = document.getElementById('quantityLabel');
                 if (currentCategory === 'currency') {
                     quantityLabel.textContent = 'Количество монет:';
                 } else if (currentCategory === 'balance') {
                     quantityLabel.textContent = 'Количество баланса:';
                 } else {
                     quantityLabel.textContent = 'Количество кейсов:';
                 }
             } else {
                 casesCountInput.style.display = 'none';
             }
            updateProductList();
            
            resetSelectedProduct();
        });
    });


    const validateNickname = (nickname) => {

        const nicknameRegex = /^[a-zA-Z0-9_]{3,16}$/;
        return nicknameRegex.test(nickname);
    };

    const validateEmail = (email) => {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };


    const updateInputStyles = (input, isValid) => {
        if (input.value.length === 0) {
            input.style.borderColor = 'var(--border-color)';
            input.style.boxShadow = 'none';
        } else {
            input.style.borderColor = isValid ? '#4CAF50' : '#f44336';
            input.style.boxShadow = isValid 
                ? '0 0 0 3px rgba(76, 175, 80, 0.2)' 
                : '0 0 0 3px rgba(244, 67, 54, 0.2)';
        }
    };


    const showInputError = (input, message) => {
        const wrapper = input.closest('.input-wrapper');
        wrapper.classList.add('error');
        const existingError = wrapper.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = message;
        wrapper.appendChild(errorMessage);
        input.value = '';

        const removeError = () => {
            wrapper.classList.remove('error');
            if (errorMessage.parentNode) {
                errorMessage.remove();
            }
            input.removeEventListener('focus', removeError);
        };
        
        input.addEventListener('focus', removeError);
    };

    nicknameInput.addEventListener('input', () => {
        const nickname = nicknameInput.value.trim();
        isNicknameValid = validateNickname(nickname);
        updateInputStyles(nicknameInput, isNicknameValid);

        let errorMsg = nicknameInput.parentElement.querySelector('.input-error');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'input-error';
            nicknameInput.parentElement.appendChild(errorMsg);
        }
        
        if (nickname.length > 0 && !isNicknameValid) {
            errorMsg.textContent = 'Никнейм должен содержать от 3 до 16 символов (буквы, цифры и _)';
            errorMsg.style.display = 'block';
        } else {
            errorMsg.style.display = 'none';
        }
    });

    emailInput.addEventListener('input', () => {
        const email = emailInput.value.trim();
        isEmailValid = validateEmail(email);
        updateInputStyles(emailInput, isEmailValid);

        let errorMsg = emailInput.parentElement.querySelector('.input-error');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'input-error';
            emailInput.parentElement.appendChild(errorMsg);
        }
        
        if (email.length > 0 && !isEmailValid) {
            errorMsg.textContent = 'Введите корректный email адрес';
            errorMsg.style.display = 'block';
        } else {
            errorMsg.style.display = 'none';
        }
    });

    const showNotification = (message, type = 'error') => {
        const container = document.querySelector('.notifications-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-icon">
                ${type === 'error' ? '⚠️' : '✓'}
            </div>
            <div class="notification-content">
                <p class="notification-message">${message}</p>
            </div>
            <button class="notification-close">&times;</button>
        `;

        container.appendChild(notification);

        const closeBtn = notification.querySelector('.notification-close');
        const closeNotification = () => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                container.removeChild(notification);
            }, 300);
        };

        closeBtn.addEventListener('click', closeNotification);
        setTimeout(closeNotification, 3000);
    };

    const showSelectError = (message) => {
        const selectBtn = document.querySelector('.select-btn');
        selectBtn.classList.add('error');
        selectBtn.querySelector('span:first-child').innerHTML = `<span class="error-message">${message}</span>`;

        const removeError = () => {
            selectBtn.classList.remove('error');
            if (!selectedProduct) {
                selectBtn.querySelector('span:first-child').textContent = 'Выберите товар';
            }
            document.removeEventListener('click', removeError);
        };
        
        setTimeout(() => {
            document.addEventListener('click', removeError);
        }, 100);
    };

    const showMessage = (message) => {
        const modal = document.getElementById('messageModal');
        const overlay = document.getElementById('messageOverlay');
        const messageText = document.getElementById('messageText');
        const okButton = modal.querySelector('.ok-button');

        messageText.textContent = message;
        modal.classList.add('show');
        overlay.classList.add('show');

        const hideModal = () => {
            modal.classList.remove('show');
            overlay.classList.remove('show');
            okButton.removeEventListener('click', hideModal);
            overlay.removeEventListener('click', hideModal);
        };

        okButton.addEventListener('click', hideModal);
        overlay.addEventListener('click', hideModal);

        const escHandler = (e) => {
            if (e.key === 'Escape') {
                hideModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    };

    purchaseBtn.addEventListener('click', () => {
        const nickname = nicknameInput.value.trim();
        const needReceipt = document.getElementById('needReceipt').checked;
        const email = emailInput.value.trim();

        if (!nickname) {
            showInputError(nicknameInput, 'Введите никнейм');
            nicknameInput.focus();
            return;
        }

        if (!isNicknameValid) {
            showInputError(nicknameInput, 'От 3 до 16 символов (буквы, цифры и _)');
            nicknameInput.focus();
            return;
        }

        if (!selectedProduct) {
            showSelectError('Пожалуйста, выберите товар');
            return;
        }

        if (needReceipt) {
            if (!email) {
                showInputError(emailInput, 'Введите email');
                emailInput.focus();
                return;
            }

            if (!isEmailValid) {
                showInputError(emailInput, 'Введите корректный email');
                emailInput.focus();
                return;
            }
        }

        console.log('Оформление покупки...');
    });

    nicknameInput.addEventListener('focus', () => {
        nicknameInput.classList.remove('error');
        nicknameInput.placeholder = 'Ваш никнейм';
    });

    serverList.addEventListener('click', (e) => {
        if (e.target.closest('.server-item')) {
            const selectBtn = document.querySelector('.select-btn');
            selectBtn.classList.remove('error');
        }
    });

    const initApp = () => {
        periodSelect.classList.add('visible');
        updateProductList();
        populateRecentPurchases();
        animateElements();
        setupMobileMenu();
        setupScrollBehavior();
    };

    const animateElements = () => {
        const elements = document.querySelectorAll('.donate-section, .sidebar > div');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('fade-in');
            }, index * 100);
        });
    };

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            if (currentCategory === 'privileges') {
                periodSelect.classList.add('visible');
            } else {
                periodSelect.classList.remove('visible');
            }

            updateProductList();
            resetSelectedProduct();
        });
    });

    periodOptions.forEach(option => {
        option.addEventListener('click', () => {
            periodOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            currentPeriod = option.dataset.period;
            updateProductList();

            if (selectedProduct && selectedProduct.category === 'privileges') {
                const product = productCategories.privileges.find(p => p.name === selectedProduct.name);
                if (product) {
                    const newPrice = product.price[currentPeriod];
                    selectedProduct.price = newPrice;
                    selectedProduct.period = currentPeriod;
                    serverPrice.textContent = newPrice;
                    updatePaymentButton(newPrice);
                }
            }
        });
    });

    const resetSelectedProduct = () => {
        selectBtn.querySelector('span:first-child').textContent = 'Выберите товар';
        serverPrice.textContent = '';
        selectBtn.classList.remove('selected');
        selectedProduct = null;
        purchaseBtn.textContent = 'Перейти к оплате';
        purchaseBtn.classList.remove('selected-for-payment');
    };

    const updatePaymentButton = (price) => {
        const cleanPrice = price.replace(' ₽', '');
        purchaseBtn.textContent = `Оплатить ${cleanPrice} ₽`;
        purchaseBtn.classList.add('selected-for-payment');
    };

    const updatePaymentButtonForQuantity = () => {
        if (selectedProduct && (selectedProduct.category === 'cases' || selectedProduct.category === 'currency' || selectedProduct.category === 'balance')) {
            const quantity = parseInt(casesCountInputElement.value) || 1;
            let basePrice;
            if (selectedProduct.category === 'currency' || selectedProduct.category === 'balance') {
                basePrice = parseFloat(selectedProduct.price.replace(' ₽', ''));
            } else {
                basePrice = parseFloat(selectedProduct.price.replace(' ₽', ''));
            }
            
            const totalPrice = basePrice * quantity;
            selectedProduct.totalPrice = `${totalPrice.toFixed(1)} ₽`;
            selectedProduct.quantity = quantity;
            serverPrice.textContent = `${totalPrice.toFixed(1)} ₽`;
            updatePaymentButton(`${totalPrice.toFixed(1)} ₽`);
        }
    };

    const applyPromoCode = (code) => {
        const promoCode = promoCodes[code.toUpperCase()];
        
        if (!promoCode) {
            showPromoError('Промокод недействителен');
            return false;
        }

        if (!selectedProduct) {
            showPromoError('Сначала выберите товар');
            return false;
        }

        let originalPrice;
        if ((selectedProduct.category === 'cases' || selectedProduct.category === 'currency' || selectedProduct.category === 'balance') && selectedProduct.totalPrice) {
            originalPrice = parseFloat(selectedProduct.totalPrice.replace(' ₽', ''));
        } else {
            originalPrice = parseFloat(selectedProduct.price.replace(' ₽', ''));
        }
        
        let discountAmount;
        let finalPrice;

        if (promoCode.type === 'percent') {
            discountAmount = (originalPrice * promoCode.discount) / 100;
            finalPrice = originalPrice - discountAmount;
        } else {
            discountAmount = promoCode.discount;
            finalPrice = originalPrice - discountAmount;
            if (finalPrice < 0) finalPrice = 0;
        }
        showPromoSuccess(promoCode, discountAmount);
        updatePaymentButton(`${finalPrice.toFixed(1)} ₽`);
        
        appliedPromoCode = {
            code: code.toUpperCase(),
            discount: discountAmount,
            originalPrice: originalPrice,
            finalPrice: finalPrice
        };

        return true;
    };

    const showPromoError = (message) => {
        promoStatus.textContent = message;
        promoStatus.className = 'promo-status error';
        promoDiscount.classList.remove('show');
        appliedPromoCode = null;
    };

    const showPromoSuccess = (promoCode, discountAmount) => {
        promoStatus.textContent = 'Промокод успешно применен!';
        promoStatus.className = 'promo-status success';
        
        const discountText = promoCode.type === 'percent' 
            ? `${promoCode.discount}%` 
            : `${discountAmount.toFixed(1)} ₽`;
            
        promoDiscount.innerHTML = `
            <strong>${promoCode.description}</strong><br>
        `;
        promoDiscount.classList.add('show');
    };

    const updateProductList = () => {
        serverList.innerHTML = '';
        const products = productCategories[currentCategory];
        products.forEach(product => {
            const serverItem = document.createElement('div');
            serverItem.className = 'server-item';
            let price = currentCategory === 'privileges' ? product.price[currentPeriod] : product.price;
            
            if (currentCategory === 'currency' || currentCategory === 'balance') {
                const unitPrice = parseFloat(price.replace(' ₽', ''));
                const unitName = product.unit;
                price = `${unitPrice} ₽ за ${unitName}`;
            }
            
            serverItem.innerHTML = `
                <span class="server-name">${product.name}</span>
                <span class="server-price">${price}</span>
            `;
            
            serverList.appendChild(serverItem);
            
            if (selectedProduct && selectedProduct.name === product.name && selectedProduct.category === currentCategory) {
                serverItem.classList.add('selected');
            }
            
            serverItem.addEventListener('click', function() {
                selectedProduct = {
                    name: product.name,
                    price: price,
                    category: currentCategory
                };
                if (currentCategory === 'privileges') {
                    selectedProduct.period = currentPeriod;
                }
                if (currentCategory === 'cases' || currentCategory === 'currency' || currentCategory === 'balance') {
                    const quantity = parseInt(casesCountInputElement.value) || 1;
                    let basePrice;
                    
                    if (currentCategory === 'currency' || currentCategory === 'balance') {
                        basePrice = parseFloat(product.price.replace(' ₽', ''));
                    } else {
                        basePrice = parseFloat(price.replace(' ₽', ''));
                    }
                    
                    const totalPrice = basePrice * quantity;
                    
                    selectedProduct.totalPrice = `${totalPrice.toFixed(1)} ₽`;
                    selectedProduct.quantity = quantity;
                    serverPrice.textContent = `${totalPrice.toFixed(1)} ₽`;
                    updatePaymentButton(`${totalPrice.toFixed(1)} ₽`);
                } else {
                    serverPrice.textContent = price;
                    updatePaymentButton(price);
                }
                
                selectBtn.querySelector('span:first-child').textContent = product.name;
                selectBtn.classList.add('selected');
                serverList.classList.remove('active');
                selectBtn.classList.remove('active');
                document.querySelectorAll('.server-item').forEach(i => {
                    i.classList.remove('selected');
                });
                this.classList.add('selected');

                promoInput.value = '';
                promoStatus.className = 'promo-status';
                promoDiscount.classList.remove('show');
                appliedPromoCode = null;
            });
        });
    };

    selectBtn.addEventListener('click', () => {
        serverList.classList.toggle('active');
        selectBtn.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.select-wrapper')) {
            serverList.classList.remove('active');
            selectBtn.classList.remove('active');
        }
    });

    const populateRecentPurchases = () => {
        const purchasesList = document.querySelector('.purchases-list');
        recentPurchases.forEach(purchase => {
            const purchaseItem = document.createElement('div');
            purchaseItem.className = 'purchase-item';
            purchaseItem.innerHTML = `
                <div class="purchase-info">
                    <span class="username">${purchase.username}</span>
                    <span class="item-name">${purchase.item}</span>
                    <span class="purchase-time">${purchase.time}</span>
                </div>
            `;
            purchasesList.appendChild(purchaseItem);
        });
    };

    const setupCopyButton = () => {
        const copyBtn = document.querySelector('.copy-btn');
        const serverAddress = document.querySelector('.server-address p');
        
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(serverAddress.textContent)
                .then(() => {
                    copyBtn.textContent = 'Скопировано!';
                    copyBtn.classList.add('copied');
                    
                    setTimeout(() => {
                        copyBtn.textContent = 'Скопировать';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                })
                .catch(err => {
                    console.error('Ошибка при копировании:', err);
                    showNotification('Не удалось скопировать адрес', 'error');
                });
        });
    };

    const needReceiptCheckbox = document.getElementById('needReceipt');
    const emailInputContainer = document.querySelector('.email-input');

    emailInputContainer.style.display = 'none';

    needReceiptCheckbox.addEventListener('change', () => {
        if (needReceiptCheckbox.checked) {
            emailInputContainer.style.display = 'block';
            setTimeout(() => {
                emailInputContainer.classList.add('show');
                emailInput.focus();
            }, 10);
        } else {
            emailInputContainer.classList.remove('show');
            setTimeout(() => {
                emailInputContainer.style.display = 'none';
            }, 300);
        }
    });

    const promoInput = document.getElementById('promo');
    const applyPromoBtn = document.querySelector('.apply-promo');
    const promoStatus = document.querySelector('.promo-status');
    const promoDiscount = document.querySelector('.promo-discount');

    applyPromoBtn.addEventListener('click', () => {
        const code = promoInput.value.trim();
        if (!code) {
            showPromoError('Введите промокод');
            return;
        }
        applyPromoCode(code);
    });

    const setupJoinButton = () => {
        const joinBtn = document.querySelector('.join-btn');
        const joinModal = document.getElementById('joinModal');
        const closeJoinModal = joinModal.querySelector('.close-modal');

        joinBtn.addEventListener('click', () => {
            joinModal.classList.add('show');
            document.body.classList.add('modal-open');
        });

        closeJoinModal.addEventListener('click', () => {
            joinModal.classList.remove('show');
            document.body.classList.remove('modal-open');
        });

        window.addEventListener('click', (e) => {
            if (e.target === joinModal) {
                joinModal.classList.remove('show');
                document.body.classList.remove('modal-open');
            }
        });
    };
    
    const setupMobileMenu = () => {
        const hamburger = document.createElement('div');
        hamburger.className = 'hamburger';
        hamburger.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        const nav = document.querySelector('.main-nav');
        const navLinks = document.querySelector('.nav-links');
        
        nav.insertBefore(hamburger, navLinks);
        
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            hamburger.classList.toggle('active');
        });
        
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    };
    
    const setupScrollBehavior = () => {
        let lastScrollTop = 0;
        const nav = document.querySelector('.main-nav');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                nav.style.transform = 'translateY(-100px)';
            } else {
                nav.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    };
    
    const rulesModal = document.getElementById('rulesModal');
    const rulesLink = document.querySelector('.nav-links a[href="#"]:nth-child(3)');
    const closeModal = document.querySelector('.close-modal');

    rulesLink.addEventListener('click', (e) => {
        e.preventDefault();
        rulesModal.classList.add('show');
        document.body.classList.add('modal-open');
    });

    closeModal.addEventListener('click', () => {
        rulesModal.classList.remove('show');
        document.body.classList.remove('modal-open');
    });

    window.addEventListener('click', (e) => {
        if (e.target === rulesModal) {
            rulesModal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && rulesModal.classList.contains('show')) {
            rulesModal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    });

    const howToBuyLink = document.querySelector('.nav-links a[href="#"]:nth-child(2)');
    const howToBuyModal = document.getElementById('howToBuyModal');
    const closeHowToBuyModal = howToBuyModal.querySelector('.close-modal');

    howToBuyLink.addEventListener('click', (e) => {
        e.preventDefault();
        howToBuyModal.classList.add('show');
        document.body.classList.add('modal-open');
    });

    closeHowToBuyModal.addEventListener('click', () => {
        howToBuyModal.classList.remove('show');
        document.body.classList.remove('modal-open');
    });

    window.addEventListener('click', (e) => {
        if (e.target === howToBuyModal) {
            howToBuyModal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = [rulesModal, joinModal, howToBuyModal];
            modals.forEach(modal => {
                if (modal.classList.contains('show')) {
                    modal.classList.remove('show');
                    document.body.classList.remove('modal-open');
                }
            });
        }
    });
    
    const supportLink = document.getElementById('support-link');
    const supportModal = document.getElementById('supportModal');
    const closeSupportModal = supportModal.querySelector('.close-modal');

    supportLink.addEventListener('click', (e) => {
        e.preventDefault();
        supportModal.classList.add('show');
        document.body.classList.add('modal-open');
    });

    closeSupportModal.addEventListener('click', () => {
        supportModal.classList.remove('show');
        document.body.classList.remove('modal-open');
    });

    window.addEventListener('click', (e) => {
        if (e.target === supportModal) {
            supportModal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && supportModal.classList.contains('show')) {
            supportModal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }
    });
    
    initApp();
    setupCopyButton();
    setupJoinButton();
    

    let darkTheme = true;
    function setTheme(dark) {
        darkTheme = dark;
        if (dark) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
            themeBtn.querySelector('.footer-btn-text').textContent = 'Сменить тему';
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
            themeBtn.querySelector('.footer-btn-text').textContent = 'Сменить тему';
        }
    }
    themeBtn.addEventListener('click', () => {
        setTheme(!darkTheme);
    });
    setTheme(true);
});