import data from './fetch-data.js';

const sections = document.querySelectorAll('.section');
const layout = document.getElementsByClassName('layout');

////////////////////////
// Local Storage
const saveListToLocalStorage = function () {
  localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
};

const getListFromLocalStorage = function () {
  return JSON.parse(localStorage.getItem('shoppingList'));
};

////////////////////////
// Shopping List
let shoppingList = getListFromLocalStorage() || [];

////////////////////////
// Funcitons

const createProductBtns = function () {
  const container = document.createElement('div');
  const btns = [
    document.createElement('button'),
    document.createElement('button'),
  ];

  btns[0].classList.add('product--increase-btn');
  btns[0].addEventListener(
    'click',
    increaseProduct(btns[0].closest('.product').dataset.id)
  );

  btns[1].classList.add('product--decrease-btn');
  btns[1].addEventListener(
    'click',
    decreaseProduct(btns[0].closest('.product').dataset.id)
  );

  btns.forEach(btn => container.append(btn));

  return container;
};

const renderAllProducts = function () {
  sections.forEach(section => {
    section.innerHTML = '';

    data
      .filter(data => data.topic === section.dataset.topic)
      .forEach(product => {
        const isInShoppingList = shoppingList.find(
          shop => shop.id === product.id
        );

        const html = `
          <div class="product${
            product.isAvailable ? '' : ' product--not-available'
          }${
          isInShoppingList !== undefined ? ' product--in-shopping-list' : ''
        }" data-id="${product.id}">
            <p class="availability">unavailable</p>
            <div class="product-buttons ${
              product.isAvailable ? '' : ' hidden'
            }">
                <button class="product--increase-btn">${
                  isInShoppingList
                    ? shoppingList[findIndexInShoppingList(product.id)].count
                    : ''
                }</button>
                <button class="product--decrease-btn">mines</button>
            </div>
            <img src="${
              product.image
            }" alt="${product.title.toLowerCase()} picture" />
            <div>
              <h3>${product.title}</h3>
              <p>${product.description}</p>
              <div>
                <p>${product.price}</p>
                <p>usd</p>
              </div>
            </div>
          </div>`;

        section.insertAdjacentHTML('beforeend', html);
      });
  });

  /////////////////////////////////////////
  // Events on buttons on product card
  const btnsOnProduct = [...document.getElementsByClassName('product-buttons')];

  btnsOnProduct
    .flatMap(el => [...el.children])
    .forEach(btn => {
      if (btn.classList.contains('product--increase-btn'))
        btn.addEventListener(
          'click',
          increaseProduct.bind(this, btn.closest('.product').dataset.id)
        );

      if (btn.classList.contains('product--decrease-btn'))
        btn.addEventListener(
          'click',
          decreaseProduct.bind(this, btn.closest('.product').dataset.id)
        );
    });
};

const renderModal = function (product) {
  const indexInShoppingList = shoppingList.findIndex(
    shop => shop.id === product.id
  );
  const isInShoppingList = indexInShoppingList !== -1;

  const html = `
  <div class="layout hidden" data-product-id="${product.id}">
    <div><button class="layout--close">X</button></div>
    <img src="${product.image}" alt="${product.title.toLowerCase()} picture" />

    <div class="modal">
      <div>
        <h3>${product.title}</h3>
        <br />
        <p>${product.description}</p>
      </div>

      <div class="layout__btns">
        <button class="${
          isInShoppingList ? ' hidden' : ''
        } layout--order-btn">order</button>
        <div class="${!isInShoppingList ? ' hidden' : ''}">
          <button class="layout--decrease-btn">mines</button>
          <p class="count">${shoppingList[indexInShoppingList]?.count}</p>
          <button class="layout--increase-btn">pluse</button>
        </div>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('afterbegin', html);
};

const openModal = async function (product) {
  const productData = findInData(product.dataset.id);

  renderModal(productData);
  layout[0].style.top = `${window.pageYOffset}px`;

  layout[0].classList.remove('hidden');

  document.body.classList.add('disable-scroll');

  // Close modal
  const btnCloseModal = layout[0].querySelector('.layout--close');

  btnCloseModal.addEventListener('click', closeModal);

  // Order btn
  const btnOrder = layout[0].querySelector('.layout--order-btn');
  btnOrder.addEventListener('click', orderproduct);

  // Increase and Decrease btn
  const btnDecrease = layout[0].querySelector('.layout--decrease-btn');
  const btnIncrease = layout[0].querySelector('.layout--increase-btn');
  btnDecrease.addEventListener(
    'click',
    decreaseProduct.bind(
      btnDecrease,
      btnDecrease.closest('.layout').dataset.productId
    ) // send id to function
  );
  btnIncrease.addEventListener(
    'click',
    increaseProduct.bind(
      btnIncrease,
      btnIncrease.closest('.layout').dataset.productId
    ) // send id to function
  );
};

const closeModal = function () {
  layout[0].remove();

  document.body.classList.remove('disable-scroll');
};

const findInData = id => data.find(data => data.id === +id);

const findIndexInShoppingList = id =>
  shoppingList.findIndex(shopping => shopping.id === +id);

const updateLayoutCounter = function (number) {
  if (!layout[0]) return;

  layout[0].querySelector('.count').textContent = number;
};

const toggleLayoutBtn = function (btn) {
  if (!layout[0]) return;
  [...btn.closest('.layout__btns').children].forEach(el =>
    el.classList.toggle('hidden')
  );
};

//////////////////////////////
// Shopping List

const orderproduct = function () {
  const product = findInData(this.closest('.layout').dataset.productId);

  // Hide order btn and revel puls-mines btn
  toggleLayoutBtn(this);

  // Add product to shopping list
  shoppingList.push({
    id: product.id,
    count: 1,
    product,
  });

  renderAllProducts();
  updateLayoutCounter(1);

  saveListToLocalStorage();
};

/**
 * @param {Number} productId
 * @description salaaaam
 */
const increaseProduct = function (productId) {
  const productIndex = findIndexInShoppingList(productId);

  if (productIndex === -1)
    throw new Error(
      `There is no element with ID of ${productId} in the shoppingList to increase its number.`
    );

  shoppingList[productIndex].count++;

  updateLayoutCounter(shoppingList[productIndex].count);

  renderAllProducts();

  saveListToLocalStorage();
};

/**
 * @param {Number} productId
 */
const decreaseProduct = function (productId) {
  const productIndex = findIndexInShoppingList(productId);

  if (productIndex === -1)
    throw new Error(`ShoppingList has not product with id of ${productId}`);

  if (shoppingList[productIndex].count <= 1) {
    shoppingList.splice(productIndex, 1);

    toggleLayoutBtn(this);

    renderAllProducts();
  } else {
    shoppingList[productIndex].count--;

    updateLayoutCounter(shoppingList[productIndex].count);
  }

  renderAllProducts();

  saveListToLocalStorage();
};

export default {
  renderAllProducts,
  openModal,
  increaseProduct,
  decreaseProduct,
  shoppingList,
};
// console.log(createProductBtns());
