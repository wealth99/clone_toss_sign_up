const nameFieldset = document.querySelector('.name-group')
            , rrnFieldset = document.querySelector('.rrn-group')
            , carrierFieldset = document.querySelector('.carrier-group')
            , phoneFieldset = document.querySelector('.phone-group')
            , nameConfirmBtn = document.querySelector('.name-confirm-btn')
            , tempConfirmBtn = document.querySelector('.temp-btn')
            , submitBtn = document.querySelector('.submit-btn')
            , inputEraseBtns = document.querySelectorAll('.input-erase-btn');

const nameRegex = /^[가-힣]{2,}$/
    , rrnRegex6 = /^[0-9]{6}$/
    , rrnRegex1 = /^[0-9]{1}$/
    , phoneRegex = /^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/;


const checkInputValue = (inputValue, regex) => {
    return regex.test(inputValue);
}

const checkInputMaxLength = (event) => {
    if(event.currentTarget.value > event.currentTarget.maxLength) {
        return event.currentTarget.value = event.currentTarget.value.slice(0, event.currentTarget.maxLength)
    }

    return event.currentTarget.value;
}

const wait = (sec) => {
    let start = Date.now(), now = start;
    while (now - start < sec * 1000) {
        now = Date.now();
    }
}

const toggleModal = () => {
    const openModalBtns = document.querySelectorAll('.open-modal-btn')
        , closeModalBtns = document.querySelectorAll('.close-modal-btn')
        , modals = document.querySelectorAll('.modal')
        , wrapper = document.querySelector('.wrapper');

    const openModal = (id, callback = null) => {
        const modal = document.querySelector(`#${id}`)
            , modal_content = modal.querySelector('.modal-content');
        
        wrapper.setAttribute('inert', 'true');
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        modal.setAttribute('aria-modal', 'true');

        gsap.fromTo(modal_content, {y: '100%'}, {y: 0, duration: .5, ease: Quint.easeOut, onComplete: () => {
            callback && typeof callback === 'function' && callback();
        }});
    }

    const closeModal = (id, callback = null) => {
        const tl = gsap.timeline()
            , modal = document.querySelector(`#${id}`)
            , modal_content = modal.querySelector('.modal-content');
        
        tl.to(modal_content, {y: '100%', duration: .5, ease: Quint.easeOut})
        .to(modal, {className: `${modal.classList[0]}`, onComplete: () => {
            wrapper.removeAttribute('inert');
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            modal.setAttribute('aria-modal', 'false');

            callback && typeof callback === 'function' && callback();
        }}, '-=.3');
    }

    const clickOutsideModal = (event) => {
        const modal = event.target.closest('.modal')
            , modal_content = event.target.closest('.modal-content')

        if (modal_content) return;
        closeModal(modal.id);
    }

    openModalBtns.forEach((btn) => {
        btn.addEventListener('click', (event) => {
            const modalId = event.currentTarget.getAttribute('data-modal-id');
            openModal(modalId);
        });
    });

    closeModalBtns.forEach((btn) => {
        btn.addEventListener('click', (event) => {
            const modalId = event.currentTarget.getAttribute('data-modal-id');
            closeModal(modalId);
        });
    });

    modals.forEach((modal) => modal.addEventListener('click', clickOutsideModal));

    return {
        openModal,
        closeModal
    };
}

const labelAnimation = (elem, position = null, type = null) => {
    if(type === 'move') {
        gsap.to(elem, {y: `${position.y}px`, x: `${position.x}px`, scale: 0.7, duration: .5, ease: Quint.easeOut});
    } else {
        gsap.to(elem, {y: 0, x: 0, scale: 1, duration: .5, ease: Quint.easeOut})
    }
}

function focusAndOpenKeyboard(elem, inputmode) {
    const tempEl = document.createElement('input');
    tempEl.style.position = 'absolute';
    tempEl.style.top = (elem.offsetTop + 7) + 'px';
    tempEl.style.left = elem.offsetLeft + 'px';
    tempEl.style.height = 0;
    tempEl.style.opacity = 0;
    tempEl.setAttribute('inputmode', `${inputmode || 'none'}`);
    document.body.appendChild(tempEl);

    wait(0.3);
    tempEl.focus();

    setTimeout(function() {
        document.body.removeChild(tempEl);
        elem.focus();
        elem.click();
    }, 100);
}

const nameInput = nameFieldset.querySelector('input')
    , nameLabel = nameFieldset.querySelector('label')
    , nameEraseBtn = nameFieldset.querySelector('.input-erase-btn');

nameInput.addEventListener('input', (event) => {
    if(event.target.value) {
        nameEraseBtn.classList.add('active')
        labelAnimation(nameLabel, {x: -4, y: -25}, 'move');
    } else {
        let timer = setTimeout(() => {
            if(event.target.value.length === 0) {
                nameEraseBtn.classList.remove('active')
                labelAnimation(nameLabel);
                clearTimeout(timer);
            }
        }, 100);
    }
});

nameInput.addEventListener('blur', () => {
    nameConfirmBtn.style.bottom = '30px';
});

nameConfirmBtn.addEventListener('click', () => {
    const isValidRrnInputs = checkInputValue(nameInput.value, nameRegex);

    if(isValidRrnInputs) {
        const tl = gsap.timeline();
        tl.to(rrnFieldset, {className: `${rrnFieldset.classList[0]}`})
        .fromTo(rrnFieldset, {height: 0}, {height: '75px', duration: .3}, '-=.5');
        
        tempConfirmBtn.remove();
        nameConfirmBtn.classList.add('off');
        submitBtn.classList.remove('off');
        focusAndOpenKeyboard(rrnFieldset.querySelector('input[name="rrn-1"]'), 'numeric');
    }
});

tempConfirmBtn.addEventListener('click', () => {
    nameConfirmBtn.click();
    tempConfirmBtn.remove();
});

const rrnInputs = rrnFieldset.querySelectorAll('input')
    , rrnLabel = rrnFieldset.querySelector('label')
    , rrnEraseBtn = rrnFieldset.querySelector('.input-erase-btn');

rrnInputs[0].addEventListener('input', (event) => {
    if(event.target.value) {
        rrnEraseBtn.classList.add('active');
        labelAnimation(rrnLabel, {x: -12, y: -25}, 'move');
    } else {
        rrnEraseBtn.classList.remove('active');
        labelAnimation(rrnLabel);
    }

    event.target.value.length === 6 && rrnInputs[1].focus();
});

rrnInputs.forEach(function(input) {
    input.addEventListener('input', (event) => {
        event.currentTarget.value = checkInputMaxLength(event);
        const isValidRrnInputs = checkInputValue(rrnInputs[0].value, rrnRegex6) && checkInputValue(rrnInputs[1].value, rrnRegex1);

        if(isValidRrnInputs) {
            const tl = gsap.timeline();
            if(carrierFieldset.classList.contains('off')) {
                tl.to(carrierFieldset, {className: `${carrierFieldset.classList[0]}`})
                .fromTo(carrierFieldset, {height: 0}, {height: '75px', duration: .3, onComplete: () => {
                    let timer = setTimeout(() => {
                        carrierFieldset.querySelector('input').focus();
                        clearTimeout(timer)
                    }, 0);
                }}, '-=.5');
            } else {
                carrierFieldset.querySelector('input').focus();
            }
        }
    });
});

const carrierInput = carrierFieldset.querySelector('input')
    , carrierLabel = carrierFieldset.querySelector('label');

carrierInput.addEventListener('focus', () => toggleModal().openModal('modal'));

const carrierList = document.querySelector('.carrier-list');
carrierList.addEventListener('click', (event) => {
    if(event.target.classList.contains('carrier-name')) {
        const tl = gsap.timeline()
            , carrierName = event.target.getAttribute('data-carrier-name')
            , wrapper = document.querySelector('.wrapper');

        labelAnimation(carrierLabel, {x: -6, y: -25}, 'move');
        carrierInput.value = carrierName;
        wrapper.removeAttribute('inert');
        toggleModal().closeModal('modal');

        if(phoneFieldset.classList.contains('off')) {
            tl.to(phoneFieldset, {className: `${phoneFieldset.classList[0]}`})
            .fromTo(phoneFieldset, {height: 0}, {height: '75px', duration: .3}, '-=.5');

            focusAndOpenKeyboard(phoneFieldset.querySelector('input'), 'numeric');
        } else {
            focusAndOpenKeyboard(phoneFieldset.querySelector('input'), 'numeric');
        }
    }
});

const phoneInput = phoneFieldset.querySelector('input')
    , phoneLabel = phoneFieldset.querySelector('label')
    , phoneEraseBtn = phoneFieldset.querySelector('.input-erase-btn');

phoneInput.addEventListener('input', (event) => {
    if(event.target.value) {
        phoneEraseBtn.classList.add('active');
        labelAnimation(phoneLabel, {x: -10, y: -25}, 'move')
    } else {
        phoneEraseBtn.classList.remove('active');
        labelAnimation(phoneLabel)
    }
});

phoneInput.addEventListener('input', (event) => {
    event.currentTarget.value = checkInputMaxLength(event);

    const isValidPhoneInput = checkInputValue(phoneInput.value, phoneRegex);
    isValidPhoneInput ? submitBtn.removeAttribute('disabled') : submitBtn.setAttribute('disabled', 'true');
});

inputEraseBtns.forEach((item) => {
    item.addEventListener('click', (event) => {
        const target = event.currentTarget
            , fieldset = target.closest('fieldset')
            , input = fieldset.querySelector('input');

        input.value = '';
        input.focus();
    });
});

window.visualViewport.onresize = () => {
    gsap.to(nameConfirmBtn, {bottom: `${window.innerHeight - window.visualViewport.height + 30}px`, duration: .2})
    gsap.to(tempConfirmBtn, {bottom: `${window.innerHeight - window.visualViewport.height + 30}px`, duration: .2})
}
