'use strict'

const productObject = {
   'Футболка UZcotton мужская': {
      price: 1051,
      discountedPrice: 522,
      remain: 2,
   },
   'Силиконовый чехол картхолдер (отверстия) для карт, прозрачный кейс бампер на Apple iPhone XR, MobiSafe': {
      price: 11500.235,
      discountedPrice: 10500.235,
      remain: Infinity
   },
   'Карандаши цветные Faber-Castell "Замок", набор 24 цвета, заточенные, шестигранные, Faber-Castell': {
      price: 475,
      discountedPrice: 247,
      remain: 2,
   },
};

const basket = document.querySelector('.basket');

const itemCheckboxes = document.querySelectorAll('.selection-item__checkbox');

const allSelectedCheckbox = document.querySelector('.selection-header__select-all');

let price;
let priceValue;
let discountedPrice;
let discountedPriceValue;
let amount;

let finalPriceValue = document.querySelector('.order-pricing__content_summary');
let originFinalPriceValue = document.querySelector('.order-pricing__content_origin');
let discount = document.querySelector('.order-pricing__content_discount');

let finalAmount = document.querySelector('.order-pricing__headline_origin');

const orderForm = document.querySelector('.order');
const orderBtn = document.querySelector('.order-action__btn');

calcAmountSelectorFinal(parseInt(finalAmount.textContent));

basket.addEventListener('click', (event) => {
   let target = event.target;

   if (target.classList.contains('selection-header__select-all')) {
      handleSelectAllCheckbox(target)
   }

   if (target.classList.contains('selection-item__checkbox')) {
      handleItemCheckbox(target);

      deliveryRangeRender(target);
   }

   if (target.classList.contains('counter__btn_minus') || target.classList.contains('counter__btn_plus')) {
      handleCounterButtonClick(target);
   }

   if (target.classList.contains('arrow__icon')) {
      handleArrowClick(target);
   }
})

function handleSelectAllCheckbox(target) {
   [...itemCheckboxes].forEach(item => {
      item.checked = target.checked;
   });

   [...itemCheckboxes].forEach(item => {
      handleItemCheckbox(item);
      deliveryRangeRender(item);
   });
}

function handleItemCheckbox(target) {
   const allChecked = [...itemCheckboxes].every(item => item.checked);
   allSelectedCheckbox.checked = allChecked;

   const isChecked = target.checked;

   const pricingElement = target.closest('.selection-item').querySelector('.pricing__value');
   const originPricingElement = target.closest('.selection-item').querySelector('.pricing__old-value');

   const currentPrice = parseFloat(pricingElement.textContent.replace(/\D/g, ''));
   const currentOriginPrice = parseFloat(originPricingElement.textContent.replace(/\D/g, ''));

   const counterValueElement = target.closest('.selection-item').querySelector('.counter__value');
   const amount = parseInt(counterValueElement.textContent);

   updateOrderPrices(isChecked, currentPrice, currentOriginPrice, amount);
}

function increment(value) {
   return value + 1;
}

function decrement(value) {
   return value - 1;
}

function deliveryRangeRender(target) {
   const productTitle = target.closest('.selection-item').querySelector('.selection-info__headline').textContent;
   const deliveryProduct = document.querySelectorAll(`[data-product = '${productTitle}']`);

   if (target.checked === false) {
      deliveryProduct.forEach(item => item.classList.add('undisplayed'));
   } else {
      deliveryProduct.forEach(item => item.classList.remove('undisplayed'));
   }

   const deliveryDateContainer = document.querySelectorAll('.delivery-info__container_date');

   deliveryDateContainer.forEach(item => {
      const dateProducts = item.querySelectorAll('.delivery-info-content__item');
      const dateProductsUndisplayed = item.querySelectorAll('.delivery-info-content__item.undisplayed');

      if (dateProducts.length === dateProductsUndisplayed.length) {
         item.classList.add('undisplayed');
      } else {
         item.classList.remove('undisplayed');
      }
   })
}

function handleCounterButtonClick(target) {
   const action = target.classList.contains('counter__btn_minus') ? 'decrement' : 'increment';
   const counterContainer = target.closest('.counter');
   const counterValueElement = counterContainer.querySelector('.counter__value');
   const currentValue = +counterValueElement.textContent;
   const productTitle = counterContainer.closest('.selection-item').querySelector('.selection-info__headline').textContent;
   const product = productObject[productTitle];

   const isChecked = target.closest('.selection-item').querySelector('.selection-item__checkbox').checked;

   counterValueElement.textContent = action === 'decrement' ? decrement(currentValue) : increment(currentValue);

   const minusButton = counterContainer.querySelector('.counter__btn_minus');
   const plusButton = counterContainer.querySelector('.counter__btn_plus');

   minusButton.disabled = currentValue - 1 === 1;
   plusButton.disabled = currentValue + 1 === product.remain;

   const priceValueElement = counterContainer.closest('.selection-item').querySelector('.pricing__old-value');
   const discountedPriceValueElement = counterContainer.closest('.selection-item').querySelector('.pricing__value');

   const price = product.price;
   const discountedPrice = product.discountedPrice;
   const amount = counterValueElement.textContent;

   calcAmountSelectorDelivery(productTitle, amount);

   updatePrices(target, priceValueElement, discountedPriceValueElement, price, discountedPrice, amount, isChecked);
}

function updatePrices(target, priceValueElement, discountedPriceValueElement, price, discountedPrice, amount, isChecked) {
   priceValueElement.innerHTML = calcPrice(amount, price);
   discountedPriceValueElement.innerHTML = calcPrice(amount, discountedPrice);

   if (isChecked) {
      finalPriceValue.innerHTML = calcFinalPrice(target, finalPriceValue, discountedPrice);
      originFinalPriceValue.innerHTML = calcFinalPrice(target, originFinalPriceValue, price);
      discount.innerHTML = calcDiscount(originFinalPriceValue, finalPriceValue);

      calcFinalAmount(target);
   }

   if (orderForm.querySelector('.immediate-pay__checkbox').checked) {
      orderBtn.textContent = `Оплатить ${finalPriceValue.textContent}`;
   }
}


function updateOrderPrices(isChecked, currentPrice, currentOriginPrice, amount) {
   let currentFinalPrice = parseFloat(finalPriceValue.textContent.replace(/\D/g, ''));
   let currentOriginFinalPrice = parseFloat(originFinalPriceValue.textContent.replace(/\D/g, ''));
   let currentFinalDiscount = currentOriginFinalPrice - currentFinalPrice;

   let currentFinalAmount = parseInt(finalAmount.textContent);

   const priceChange = isChecked ? currentPrice : -currentPrice;
   const originPriceChange = isChecked ? currentOriginPrice : -currentOriginPrice;

   const finalAmountChange = isChecked ? amount : -amount;

   currentFinalPrice += priceChange;
   currentOriginFinalPrice += originPriceChange;
   currentFinalDiscount = currentOriginFinalPrice - currentFinalPrice;
   currentFinalAmount += finalAmountChange;

   calcAmountSelectorFinal(currentFinalAmount);

   finalPriceValue.innerHTML = `${Math.round(currentFinalPrice).toLocaleString().replace(/\s/g, ' ')} <span> сом</span>`;
   originFinalPriceValue.innerHTML = `${Math.round(currentOriginFinalPrice).toLocaleString().replace(/\s/g, ' ')} <span> сом</span>`;
   discount.innerHTML = `−${Math.round(currentFinalDiscount).toLocaleString().replace(/\s/g, ' ')} <span> сом</span>`;
   finalAmount.textContent = `${currentFinalAmount} товара`;

   if (orderForm.querySelector('.immediate-pay__checkbox').checked) {
      orderBtn.textContent = `Оплатить ${finalPriceValue.textContent}`;
   }
}


function calcAmountSelectorDelivery(productTitle, counterValue) {
   const amountSelector = document.querySelector(`.amount-selector_delivery[data-product = '${productTitle}']`);
   amountSelector.textContent = counterValue;
}

function calcAmountSelectorFinal(amount) {
   const dataAmountSelector = document.querySelectorAll('[data-amount-selector]');
   dataAmountSelector.forEach(item => item.textContent = amount);
}

function calcPrice(amount, price) {
   const total = Math.round(+amount * price);
   return `${total.toLocaleString().replace(/\s/g, ' ')} <span> сом</span>`;
}

function calcFinalPrice(target, finalPriceValue, price) {
   const currentPrice = parseInt(finalPriceValue.textContent.replace(/\s/g, ''));
   const updatedPrice = target.classList.contains('counter__btn_plus') ? currentPrice + price : currentPrice - price;
   return `${Math.round(updatedPrice).toLocaleString().replace(/\s/g, ' ')}<span> сом</span>`;
}

function calcDiscount(originFinalPriceValue, finalPriceValue) {
   const originPrice = parseInt(originFinalPriceValue.textContent.replace(/\s/g, ''));
   const finalPrice = parseInt(finalPriceValue.textContent.replace(/\s/g, ''));
   return `−${Math.round(originPrice - finalPrice).toLocaleString().replace(/\s/g, ' ')}<span> сом</span>`;
}

function calcFinalAmount(target) {
   const currentAmount = parseInt(finalAmount.textContent);

   finalAmount.textContent = target.classList.contains('counter__btn_plus') ? `${currentAmount + 1} товара` : `${currentAmount - 1} товара`;

   if (target.classList.contains('counter__btn_plus')) {
      calcAmountSelectorFinal(currentAmount + 1);
   } else {
      calcAmountSelectorFinal(currentAmount - 1);
   }
}

function handleArrowClick(target) {
   const listElement = target.closest('[class*=basket]').querySelector('[class*=list]');
   listElement.classList.toggle('undisplayed')

   if (listElement.classList.contains('undisplayed')) {
      target.style.rotate = "180deg"
   } else {
      target.style.rotate = "360deg"
   }

   if (listElement.classList.contains('selection__list')) {
      const headerElement = listElement.closest('.selection').querySelector('.selection-header');
      const headerInput = headerElement.querySelector('.selection-header__select-all');
      const headerLabel = headerElement.querySelector('.selection-header__select-label');

      if (headerInput.classList.contains('undisplayed') && headerLabel.classList.contains('undisplayed')) {
         headerElement.querySelector('.insert-summary').remove()
      } else {
         headerElement.insertAdjacentHTML("afterbegin", `<p class="insert-summary">${finalAmount.textContent} · ${finalPriceValue.textContent}</p>`)
      }

      headerInput.classList.toggle('undisplayed');
      headerLabel.classList.toggle('undisplayed');
   }

   if (target.closest('.absention-header')) {
      target.closest('.absention-header').classList.toggle('absention-header_closed');
   }


}

[...document.querySelectorAll('.counter__btn_minus')].forEach(item => {
   item.disabled = item.closest('.counter').querySelector('.counter__value').textContent === '1';
});

[...document.querySelectorAll('.counter__btn_plus')].forEach(item => {
   const remain = productObject[item.closest('.selection-item').querySelector('.selection-info__headline').textContent].remain;
   item.disabled = +item.closest('.counter').querySelector('.counter__value').textContent === remain;
});


orderForm.addEventListener('click', (event) => {
   let target = event.target;

   handleOrderForm(target);
})

function handleOrderForm(target) {
   if (target.classList.contains('immediate-pay__checkbox') && target.checked === true) {
      orderBtn.textContent = `Оплатить ${finalPriceValue.textContent}`;
   } else {
      orderBtn.textContent = `Заказать`;
   }

   if (target.classList.contains('change-icon')) {
      const popupElement = target.classList.contains('change-icon__delivery') ? document.querySelector('.delivery-popup') : document.querySelector('.payment-popup');
      renderPopup(popupElement)
   }

   if (target === orderBtn) {
      isFormEmpty();

   }
}

const deliveryPopup = document.querySelector('.delivery-popup');

deliveryPopup.addEventListener('click', (event) => {
   let target = event.target;

   if (target.closest('button').classList.contains('delivery-popup__closed-btn')) {
      deliveryPopup.classList.toggle('visible');

      if (document.documentElement.clientWidth <= 500) {
         document.querySelector('body').classList.remove('fixed');
      }
   }

   if (target.classList.contains('delivery-popup__way-btn')) {
      if (target.closest('li').classList.contains('delivery-popup__way_post-point')) {
         document.querySelector('.delivery-popup__way_post-point').classList.add('delivery-popup__way_active');
         document.querySelector('.delivery-popup__way_courier').classList.remove('delivery-popup__way_active');
         document.querySelector('.delivery-popup-form__list_post-point').classList.remove('delivery-popup-form__list_inactive');
         document.querySelector('.delivery-popup-form__list_courier').classList.add('delivery-popup-form__list_inactive');

      } else {
         document.querySelector('.delivery-popup__way_courier').classList.add('delivery-popup__way_active');
         document.querySelector('.delivery-popup__way_post-point').classList.remove('delivery-popup__way_active');
         document.querySelector('.delivery-popup-form__list_courier').classList.remove('delivery-popup-form__list_inactive');
         document.querySelector('.delivery-popup-form__list_post-point').classList.add('delivery-popup-form__list_inactive');

      }
   }

})

const paymentPopup = document.querySelector('.payment-popup');

paymentPopup.addEventListener('click', (event) => {
   let target = event.target;

   if (target.closest('button').classList.contains('payment-popup__closed-btn')) {
      paymentPopup.classList.toggle('visible');

      if (document.documentElement.clientWidth <= 500) {
         document.querySelector('body').classList.remove('fixed');
      }
   }
})


const buttonChangeDelivery = document.querySelector('.delivery__change');

buttonChangeDelivery.addEventListener('click', () => {
   renderPopup(deliveryPopup);
})

const buttonChangePayment = document.querySelector('.payment__change');

buttonChangePayment.addEventListener('click', () => {
   renderPopup(paymentPopup);

})

const rejectFree = document.querySelectorAll('.reject__free')

rejectFree.forEach(item => {
   item.addEventListener('mouseover', function () {
      item.closest('div').querySelector('[class*=reject-popup]').style.visibility = 'visible';
   });

   item.addEventListener('mouseout', function () {
      item.closest('div').querySelector('[class*=reject-popup]').style.visibility = 'hidden';
   });
});

function renderPopup(element) {
   const windowHeight = window.innerHeight;
   const scrollY = window.scrollY;

   const containerTop = windowHeight / 2 + scrollY;

   element.style.top = containerTop + "px";

   element.classList.toggle('visible');

   if (document.documentElement.clientWidth <= 500) {
      document.querySelector('body').classList.add('fixed');
   }
}

const deliveryChooseBtn = document.querySelector('.delivery-popup-form__btn-choose')

deliveryChooseBtn.addEventListener('click', () => {
   handleDeliveryChooseBtn();
})

function handleDeliveryChooseBtn() {
   const deliveryWay = document.querySelector('.delivery-popup__way_active .delivery-popup__way-btn').textContent;
   const chosenAdress = deliveryWay === 'В пункт выдачи' ? document.querySelector('.delivery-popup-form__radio_post-point:checked').getAttribute('value') : document.querySelector('.delivery-popup-form__radio_courier:checked').getAttribute('value');

   if (deliveryWay === 'В пункт выдачи') {
      document.querySelector('.order-delivery__title').textContent = 'Доставка в пункт выдачи';
      document.querySelector('.delivery-info__title_giving').textContent = 'Пункт выдачи';
      document.querySelector('.giving__description').classList.remove('visible')
   } else {
      document.querySelector('.order-delivery__title').textContent = 'Доставка по адресу';
      document.querySelector('.delivery-info__title_giving').textContent = 'Доставка';
      document.querySelector('.giving__description').classList.add('invisible');
   }

   document.querySelector('.giving__adress').textContent = chosenAdress;
   document.querySelector('.order-delivery__adress').textContent = chosenAdress;

   deliveryPopup.classList.toggle('visible');

   if (document.documentElement.clientWidth <= 500) {
      document.querySelector('body').classList.remove('fixed');
   }
}

const paymentChooseBtn = document.querySelector('.payment-popup-form__btn-choose');

paymentChooseBtn.addEventListener('click', () => {
   handlePaymentChooseBtn();
})

function handlePaymentChooseBtn() {
   const chosenCard = document.querySelector('.payment-popup-form__radio:checked').getAttribute('value')

   document.querySelector('.payment__card img').setAttribute('src', `img/main/payment/${chosenCard}.svg`);
   document.querySelector('.order-payment-card__system img').setAttribute('src', `img/main/payment/${chosenCard}.svg`);

   paymentPopup.classList.toggle('visible');

   if (document.documentElement.clientWidth <= 500) {
      document.querySelector('body').classList.remove('fixed');
   }
}

const recipientForm = document.querySelector('.recipient');

recipientForm.addEventListener('click', (event) => {
   const target = event.target;

   target.addEventListener('input', () => {
      if (target.value.length > 0) {
         target.closest('.recipient-form__container').querySelector('.recipient-form__label').classList.add('visible');
      } else {
         target.closest('.recipient-form__container').querySelector('.recipient-form__label').classList.remove('visible');
      }
   })

   handleRecipientForm(target);
})

function handleRecipientForm(target) {
   if (target.classList.contains('recipient-form__input_name')) {
      target.addEventListener('blur', () => {
         let errorMessageElement = document.querySelector('.recipient-form__error_name');

         if (target.value === '') {
            errorMessageElement.textContent = '';
            target.classList.remove('recipient-form__input_error');
         }
         else if (!isValidNameorSurname(target.value)) {
            errorMessageElement.textContent = 'Укажите имя';
            target.classList.add('recipient-form__input_error');
         } else {
            errorMessageElement.textContent = '';
            target.classList.remove('recipient-form__input_error');
         }
      })
   }

   if (target.classList.contains('recipient-form__input_surname')) {
      target.addEventListener('blur', () => {
         let errorMessageElement = document.querySelector('.recipient-form__error_surname');

         if (target.value === '') {
            errorMessageElement.textContent = '';
            target.classList.remove('recipient-form__input_error');
         }
         else if (!isValidNameorSurname(target.value)) {
            errorMessageElement.textContent = 'Введите фамилию';
            target.classList.add('recipient-form__input_error');
         } else {
            errorMessageElement.textContent = '';
            target.classList.remove('recipient-form__input_error');
         }
      })
   }

   if (target.classList.contains('recipient-form__input_email')) {
      target.addEventListener('blur', () => {
         let errorMessageElement = document.querySelector('.recipient-form__error_email');

         if (target.value === '') {
            errorMessageElement.textContent = '';
            target.classList.remove('recipient-form__input_error');
         }
         else if (!isValidEmail(target.value)) {
            errorMessageElement.textContent = 'Проверьте адрес электронной почты';
            target.classList.add('recipient-form__input_error');
         } else {
            errorMessageElement.textContent = '';
            target.classList.remove('recipient-form__input_error');
         }
      })
   }

   if (target.classList.contains('recipient-form__input_phone')) {

      target.addEventListener('input', () => {
         target.value = target.value.replace(/[a-zA-Zа-яА-Я]/g, '');
      })

      target.addEventListener('blur', () => {
         let errorMessageElement = document.querySelector('.recipient-form__error_phone');

         if (target.value === '') {
            errorMessageElement.textContent = '';
            target.classList.remove('recipient-form__input_error');
         } else {
            target.value = target.value.replace(/\s/g, '')
            target.value = `${target.value.slice(0, 2)} ${target.value.slice(2, 5)} ${target.value.slice(5, 8)} ${target.value.slice(8, 10)} ${target.value.slice(10)}`

            if (!isValidPhone(target.value)) {
               errorMessageElement.textContent = 'Формат: +9 999 999 99 99';
               target.classList.add('recipient-form__input_error');
            } else {
               errorMessageElement.textContent = '';
               target.classList.remove('recipient-form__input_error');
            }
         }
      })
   }

   if (target.classList.contains('recipient-form__input_inn')) {
      target.addEventListener('blur', () => {
         let errorMessageElement = document.querySelector('.recipient-form__error_inn');

         if (target.value === '') {
            errorMessageElement.textContent = 'Для таможенного оформления';
            errorMessageElement.style.color = 'inherit';
            target.classList.remove('recipient-form__input_error');
         }
         else if (target.value.length !== 14) {
            errorMessageElement.textContent = 'Проверьте ИНН';
            errorMessageElement.style.color = '#F55123'
            target.classList.add('recipient-form__input_error');
         } else {
            errorMessageElement.textContent = 'Для таможенного оформления';
            errorMessageElement.style.color = 'inherit';
            target.classList.remove('recipient-form__input_error');
         }
      })
   }
}

function isValidNameorSurname(string) {
   const stringRegex = /^[а-яА-Яa-zA-Z]+$/;
   return stringRegex.test(string);
}

function isValidEmail(email) {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return emailRegex.test(email);
}

function isValidPhone(phone) {
   const phoneRegex = /^\+\d \d{3} \d{3} \d{2} \d{2}$/;
   return phoneRegex.test(phone);
}

function isFormEmpty() {
   const formElements = document.querySelectorAll('.recipient-form__input');

   formElements.forEach(item => {
      if (item.value.length === 0) {
         item.closest('[class*=container]').querySelector('.recipient-form__error').textContent = 'Заполните поле';
         item.closest('[class*=container]').querySelector('.recipient-form__input').classList.add('recipient-form__input_error');
         document.querySelector('.recipient-form__error_inn').classList.add('recipient-form__input_error');
      }
   })

   recipientForm.scrollIntoView({
      behavior: "smooth",
      block: "end"
   });
}

if (document.documentElement.clientWidth < 500) {
   document.querySelector('.header-burger__icon').setAttribute('src', 'img/header/mobile-burger.svg');
   document.querySelectorAll('.selection-info__headline').forEach((item, index) => {
      if (index === 1) {
         item.textContent = 'Силиконовый чехол картхолдер (отверстия) для...'
      } else if (index === 2) {
         item.textContent = 'Карандаши цветные Faber-Castell "Замок", набор 24 цв...'
      }

   });
} else {
   document.querySelector('.header-burger__icon').setAttribute('src', 'img/header/burger.svg');
}

if (document.documentElement.clientWidth < 461) {
   document.querySelectorAll('.selection-info__headline').forEach((item, index) => {
      if (index === 1) {
         item.textContent = 'Силиконовый чехол картхолдер (отверстия) для...'
      } else if (index === 2) {
         item.textContent = 'Карандаши цветные Faber-Castell "Замок", набор 24 цв...'
      }
   });

   document.querySelectorAll('.absention-info__headline').forEach((item, index) => {
      if (index === 1) {
         item.textContent = 'Силиконовый чехол картхолдер (отверстия) для...'
      } else if (index === 2) {
         item.textContent = 'Карандаши цветные Faber-Castell "Замок", набор 24 цв...'
      }
   });
}

