let listaProductos = [];
let carrito = []
let favoritos = []



//---------------------------------------------LISTA DE PRODUCTOS----------------------------------------------

class Producto {
    constructor(id, nombre, codigo, tipo, precio, imagen) {
        this.id = id;
        this.nombre = nombre;
        this.codigo = codigo;
        this.tipo = tipo;
        this.precio = precio;
        this.imagen = imagen;
    }
}

class ProductoCarrito {
    constructor(producto, cantidad) {
        this.producto = producto
        this.cantidad = cantidad
    }
}

async function obtenerJson() {
    try {
        const response = await fetch("./json/productos.json")
        const data = await response.json()

        data.forEach((prod) => {
            listaProductos.push(new Producto(prod.id, prod.nombre, prod.codigo, prod.tipo, prod.precio, prod.imagen))
        })
    } catch {
        console.log("error no se pudo cargar productos reintente");
    }
}

//---------------------------------- ALERTAS----------------------------------

function alertSeEncuentraCarrito(id) {
    Swal.fire({
        icon: 'info',
        title: 'El producto seleccionado ya se encuentra en el Carrito',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Ir al Carrito',
        denyButtonText: `Quitar del Carrito`,
        background: "white",
        color: "black",
        confirmButtonColor: "blue",
        denyButtonColor: "red",
        cancelButtonColor: "black"

    }).then((result) => {
        if (result.isConfirmed) {
            modalCarrito.style.display = "flex"
        } else if (result.isDenied) {
            eliminarCarrito(id)
        }
    })
}

function alertFinCompra(alert) {
    Swal.fire(alert)
}

function alertToast(leyenda, color) {
    Toastify({
        text: leyenda,
        duration: 2500,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: color,
        },
    }).showToast();
}

//-----------------------------------------------------MAIN---------------------------------------------------

function crearCardsMain(productos) {
    let cardsBloque = document.querySelector("#Productos-main");

    cardsBloque.innerHTML = ""

    productos.forEach(producto => {
        cardsBloque.innerHTML += crearCard(producto);
    })
}

function crearCard(producto) {

    let iconFav = estaEnFav(producto.id) ? "fav black.svg" : "fav.svg";

    let cardCreada = `
        <div class="Productos-main-Card">
            <div class="Productos-main-agregar-fav">
                <img src="./img/icon/${iconFav}" alt="" id="${producto.id}" onclick="manejarFavs(${producto.id})">
            </div>
            <div class="Productos-main-Img"><img src="./img/prod/${producto.imagen}" alt=""></div>
            <div class="Productos-main-Cuerpo">
                <div class="Productos-main-Desc">
                    <h2>${producto.nombre}</h2>
                    <h3>${producto.codigo}</h3>
                </div>
                <div class="Productos-main-Agregar">
                    <p>$ ${producto.precio}</p>
                    <p class="btn-carrito"id="${producto.id}" onclick="manejarCarrito(${producto.id})"; ">Agregar al carrito</p>
                </div>
            </div>
        </div>
        `;
    return cardCreada
}


//----------------------------------------------------CARRITO--------------------------------------------------

function manejarCarrito(id) {
    estaEnCarrito(id) ? alertSeEncuentraCarrito(id) : agregarCarrito(id)
}

function estaEnCarrito(id) {
    let encontrar = carrito.find(prod => prod.producto.id == id)
    return encontrar != undefined
}

function agregarCarrito(id) {
    let productoSelecFav = listaProductos.find(producto => producto.id == id)
    let prodCarrito = new ProductoCarrito(productoSelecFav, 1)
    carrito.push(prodCarrito)

    let cardCar = document.querySelector("#carrito");
    cardCar.innerHTML += crearCardCarrito(prodCarrito);

    almacenarProductosLocalStorage("localCarrito", carrito)

    alertToast("Producto agregado Correctamente", "black")

    contadorCarrito()

    contadorCarritoModal()

    contadorCarritoTotal()
}

function eliminarCarrito(id) {
    let index = carrito.findIndex(prodCarrito => prodCarrito.producto.id === id);
    carrito.splice(index, 1)

    let card = document.querySelector(`#car-${id}`)
    card.parentNode.removeChild(card)

    removerProductoLocalStorage("localCarrito")

    almacenarProductosLocalStorage("localCarrito", carrito)

    alertToast("Producto eliminado correctamente", "red")

    contadorCarrito()

    contadorCarritoModal()

    contadorCarritoTotal()
}

function crearCardCarrito(prodCarrito) {
    let cardCreada = `
    <div class="modal-card" id="car-${prodCarrito.producto.id}">
        <div class="modal-img">
            <img src="./img/prod/${prodCarrito.producto.imagen}" alt="">
        </div>
        <div class="desc-producto">
            <div class="modal-card-desc">
                <h2>${prodCarrito.producto.nombre} </h2>
                <h4>${prodCarrito.producto.codigo}</h4>
                <h3>$ ${prodCarrito.producto.precio}</h3>
            </div>
            <div class="carrito-modal-contador">
                <input type="number" id="quantity-${prodCarrito.producto.id}" onchange="cantidadProductos(this, ${prodCarrito.producto.id})" name="quantity"  min="1" max="5" value="${prodCarrito.cantidad}" >
            </div>

            <div class="modal-card-accion">
                <h2 class="btn-eliminar" onclick="eliminarCarrito(${prodCarrito.producto.id})">Eliminar de carrito</h2>
            </div>
        </div>
    </div>
    `;

    return cardCreada
}

function contadorCarrito() {
    let contadorCar = document.getElementById("contador-Cart")
    contadorCar.innerHTML = `${carrito.length}`
}

//Modal Carrito cantidad producto y totales

function cantidadProductos(element, id) {
    let encontrar = carrito.find(prod => prod.producto.id == id)

    encontrar.cantidad = element.value;

    let valorHtml = document.querySelector(`#quantity-${id}`)
    valorHtml.setAttribute('value', element.value)

    almacenarProductosLocalStorage("localCarrito", carrito)

    contadorCarritoTotal()

    contadorCarritoModal()
}

function contadorCarritoModal() {
    let contadorCarModal = document.getElementById("contador-Cart-modal")

    let total = 0

    for (let productoCarrito of carrito) {
        total += parseInt(productoCarrito.cantidad)
    }

    contadorCarModal.innerHTML = `${total}`
}


function contadorCarritoTotal() {
    let contadorCar = document.getElementById("total-cart-modal")

    let total = 0
    for (let productoCarrito of carrito) {
        total += productoCarrito.producto.precio * productoCarrito.cantidad
    }

    contadorCar.innerHTML = `${total}`
}

//vaciar carrito 

var vaciarCarrito = document.getElementById("vaciar-carrito");


vaciarCarrito.onclick = function () {
    let carritoHtml = document.getElementById("carrito")
    carritoHtml.innerHTML = ""

    carrito = []

    removerProductoLocalStorage("localCarrito")

    contadorCarrito()

    contadorCarritoModal()

    contadorCarritoTotal()
}


//---------------------------------------------------FAVORITOS-------------------------------------------------

function manejarFavs(id) {
    estaEnFav(id) ? eliminarFavorito(id) : agregarFavorito(id)
}

function estaEnFav(id) {
    let encontrar = favoritos.find(prod => prod.id == id)
    return encontrar != undefined
}

function agregarFavorito(id) {
    let productoSelecFav = listaProductos.find(producto => producto.id == id)
    favoritos.push(productoSelecFav)

    document.getElementById(productoSelecFav.id).src = "./img/icon/fav black.svg";

    let cardFav = document.querySelector("#modal-contenedor");
    cardFav.innerHTML += crearCardFav(productoSelecFav);

    almacenarProductosLocalStorage("localFavoritos", favoritos)

    alertToast("Producto agregado a Favoritos", "black")

    contadorFavoritos()
}

function eliminarFavorito(id) {
    let index = favoritos.findIndex(producto => producto.id === id);
    favoritos.splice(index, 1)

    let productoSelecFav = listaProductos.find(producto => producto.id == id)
    document.getElementById(productoSelecFav.id).src = "./img/icon/fav.svg";

    let card = document.querySelector(`#fav-${id}`)
    card.parentNode.removeChild(card)

    removerProductoLocalStorage("localFavoritos")
    almacenarProductosLocalStorage("localFavoritos", favoritos)

    alertToast("Producto quitado de Favoritos", "red")

    contadorFavoritos()
}

function crearCardFav(producto) {
    let cardCreada = `
    <div class="modal-card" id="fav-${producto.id}">
            <div class="modal-img">
                <img src="./img/prod/${producto.imagen}" alt="">
            </div>
            <div class="desc-producto">
                <div class="modal-card-desc">
                <h2>${producto.nombre} </h2>
                <h4>${producto.codigo}</h4>
                <h3>$ ${producto.precio}</h3>
            </div>
                <div class="modal-card-accion">
                    <h2 class="btn-agregar" onclick="agregarCarrito(${producto.id})">Agregar al Carrito</h2>
                    <h2 class="btn-eliminar" onclick="eliminarFavorito(${producto.id})">Eliminar</h2>
                </div>
            </div>
        </div>
                `;

    return cardCreada
}

function contadorFavoritos() {
    let contadorFav = document.getElementById("contador-Fav")
    contadorFav.innerHTML = `${favoritos.length}`
}

//-----------------------------------------------------MODAL---------------------------------------------------

// modal fav

var modalFavorito = document.getElementById("modalFav");
var btnModalFavorito = document.getElementById("btn-modal-fav");
var btnCloseModalFavorito = document.getElementsByClassName("modal-cerrar")[0];

btnModalFavorito.onclick = function () {
    modalFavorito.style.display = "flex";

    cantProd()
}

btnCloseModalFavorito.onclick = function () {
    modalFavorito.style.display = "none";
}

// modal carrito

var modalCarrito = document.getElementById("modalCarrito");
var btnModalCarrito = document.getElementById("btn-modal-cart");
var btnCloseModalCarrito = document.getElementsByClassName("modal-cerrar2")[0];

btnModalCarrito.onclick = function () {
    modalCarrito.style.display = "flex";
}

btnCloseModalCarrito.onclick = function () {
    modalCarrito.style.display = "none";
}

//finalizar compra 

var btnFinalizarCompra = document.getElementById("btnFinalizarCompra")

btnFinalizarCompra.onclick = function () {
    if (carrito.length > 0){
    alertFinCompra('Muchas Gracias por su compra !')

    let carritoHtml = document.getElementById("carrito")
    carritoHtml.innerHTML = ""

    carrito = []

    removerProductoLocalStorage("localCarrito")

    contadorCarrito()

    contadorCarritoModal()

    contadorCarritoTotal()
    }else{
        alertFinCompra('No posees productos en el carrito')
    }

}
// -------------------------------------------------FILTROS-------------------------------------------------------

let filtrados = listaProductos

// filtro por tipo

let btnFiltroTodos = document.getElementById("filtroTodos")
let btnFiltroRemera = document.getElementById("filtroRemera")
let btnFiltroPantalon = document.getElementById("filtroPantalon")
let btnFiltroBuzo = document.getElementById("filtroBuzo")
let btnFiltroCalzado = document.getElementById("filtroCalzado")

btnFiltroTodos.onclick = filtrarProductos
btnFiltroRemera.onclick = filtrarProductos
btnFiltroPantalon.onclick = filtrarProductos
btnFiltroBuzo.onclick = filtrarProductos
btnFiltroCalzado.onclick = filtrarProductos

function filtrarProductos(event) {
    const idBoton = event.target.id
    switch (idBoton) {
        case "filtroTodos":
            filtrados = listaProductos;
            colorBtnFiltro(this, "filtroTipo")
            crearCardsMain(filtrados)
            break;

        case "filtroRemera":
            filtrados = listaProductos.filter(
                (producto) => producto.tipo == "remera"
            )
            colorBtnFiltro(this, "filtroTipo")
            crearCardsMain(filtrados)
            break;

        case "filtroPantalon":
            filtrados = listaProductos.filter(
                (producto) => producto.tipo == "pantalon"
            )
            colorBtnFiltro(this, "filtroTipo")
            crearCardsMain(filtrados)
            break;

        case "filtroBuzo":
            filtrados = listaProductos.filter(
                (producto) => producto.tipo == "buzo"
            )
            colorBtnFiltro(this, "filtroTipo")
            crearCardsMain(filtrados)
            break;

        case "filtroCalzado":
            filtrados = listaProductos.filter(
                (producto) => producto.tipo == "calzado"
            )
            colorBtnFiltro(this, "filtroTipo")
            crearCardsMain(filtrados)
            break;
    }
}


// Filtros por costo

let btnFiltroMayor = document.getElementById("filtroMayor")
let btnFiltroMenor = document.getElementById("filtroMenor")

btnFiltroMayor.onclick = function () {
    colorBtnFiltro(this, "filtroPrecio")

    filtrados.sort((a, b) => {
        return b.precio - a.precio;
    });
    crearCardsMain(filtrados)
}

btnFiltroMenor.onclick = function () {
    colorBtnFiltro(this, "filtroPrecio")

    filtrados.sort((a, b) => {
        return a.precio - b.precio;
    });
    crearCardsMain(filtrados)
}

//Color btn de filtro

function colorBtnFiltro(element, tipo) {
    let botones = document.getElementsByClassName(tipo)
    for (let element of botones) {
        element.style.color = "black"
    }
    element.style.color = "#40916c"
}


//------------------------------------STORAGE------------------------------------------

function almacenarProductosLocalStorage(arrayStorage, array) {
    localStorage.setItem(arrayStorage, JSON.stringify(array));
}

function removerProductoLocalStorage(arrayStorage) {
    localStorage.removeItem(arrayStorage)
}

function traerProductosLocalStorage(key) {
    let storeList = localStorage.getItem(key)
    return storeList == null ? [] : JSON.parse(storeList)
}

//Favaritos

function pintarFavoritos() {
    let cardFav = document.querySelector("#modal-contenedor");
    favoritos.forEach((productos) => cardFav.innerHTML += crearCardFav(productos))
}

//Carrito

function pintarCarrito() {
    let cardCar = document.querySelector("#carrito");
    carrito.forEach((prodCarrito) => cardCar.innerHTML += crearCardCarrito(prodCarrito))

}

//Iniciar local storage

function inciarLocalStorage() {
    favoritos = traerProductosLocalStorage("localFavoritos")
    contadorFavoritos()
    pintarFavoritos()

    carrito = traerProductosLocalStorage("localCarrito")
    contadorCarrito()
    pintarCarrito()
}


//----------------------------- MAIN-Inicializar-------------------------------

function main() {
    obtenerJson()
        .then(response => {
            inciarLocalStorage()
            crearCardsMain(filtrados)
            contadorCarritoTotal()
            contadorCarritoModal()
        })
}

main()