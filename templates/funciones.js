let carrito = [];
let contadorFacturas = 1; 
let facturasGuardadas = []; // Guardar todas las facturas completas

async function cargarDatosInventario() {
    try {
        const respuesta = await fetch('http://127.0.0.1:5000/datosInventario');
        const datos = await respuesta.json();
        const cuerpoTabla = document.getElementById("base_datos_inventario");
        cuerpoTabla.innerHTML = "";

        datos.forEach((item) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${item.codigo}</td>
                <td>${item.Nombre_elemento}</td>
                <td>${item.precio_unitario}</td>
                <td>${item.cantidad_exis}</td>
                <td>${(item.precio_unitario * 1.2)}</td>
                <td>
                    <button type="button" onclick="actualizar(${item.codigo})">🔄</button>
                    <button type="button" onclick="eliminar(${item.codigo})">❌</button>
                </td>
            `;
            cuerpoTabla.appendChild(fila);
        });
    } catch (error) {
        console.log("Error cargando inventario:", error);
    }
}

// Agregar elemento
document.getElementById('FormularioElemento').addEventListener('submit', async function (event) {
    event.preventDefault();
    const elemento = {
        elemento: {
            codigo: parseInt(document.getElementById('codigo').value),
            Nombre_elemento: document.getElementById('Nombre_elemento').value,
            precio_unitario: parseFloat(document.getElementById('precio_unitario').value),
            cantidad_exis: parseInt(document.getElementById('cantidad_exis').value)
        }
    };
    try {
        const response = await fetch('http://127.0.0.1:5000/añadirElemento', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(elemento)
        });
        if (response.ok) {
            console.log("Agregado correctamente.");
            cargarDatosInventario();
            document.getElementById('FormularioElemento').reset();
        }
    } catch (error) {
        console.error('Error al agregar:', error);
    }
});

// Eliminar elemento
async function eliminar(codigo) {
    if (!confirm("¿Eliminar este elemento?")) return;
    try {
        const response = await fetch('http://127.0.0.1:5000/eliminarElemento/' + codigo, {
            method: 'DELETE'
        });
        if (response.ok) {
            console.log("Eliminado correctamente.");
            cargarDatosInventario();
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
    }
}

// Cargar datos para actualizar
async function actualizar(codigo) {
    try {
        const respuesta = await fetch('http://127.0.0.1:5000/buscarElemento/'+codigo);
        const datos = await respuesta.json();
        document.getElementById("codigo").value = datos[0].codigo;
        document.getElementById("Nombre_elemento").value = datos[0].Nombre_elemento;
        document.getElementById("precio_unitario").value = datos[0].precio_unitario;
        document.getElementById("cantidad_exis").value = datos[0].cantidad_exis;
        
    } catch (error) {
        console.log("Error cargando para actualizar:", error);
    }
}

// Guardar cambios
async function guardarCambios() {
    const id = document.getElementById('codigo').value;
    
    const material = {
        Nombre_elemento: document.getElementById('Nombre_elemento').value,
        precio_unitario: document.getElementById('precio_unitario').value,
        cantidad_exis: document.getElementById('cantidad_exis').value
    };
    try {
        const response = await fetch('http://127.0.0.1:5000/actualizarElemento/'+id, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(material)
        });
        if (response.ok) {
            console.log("Actualizado correctamente.");
            cargarDatosInventario();
            document.getElementById('FormularioElemento').reset();
        }
    } catch (error) {
        console.error('Error al actualizar:', error);
    }
}

// Buscar por nombre con funcion eliminar y actualizar
async function buscarElementoNombre() {
    const nombre = document.getElementById("buscar_nombre").value;
    if (!nombre) {
        alert("Ingrese un nombre");
        return;
    }

    try {
        const respuesta = await fetch('http://127.0.0.1:5000/buscarElementoNombre/'+nombre);
        if (respuesta.ok) {
            const datos = await respuesta.json();
            const cuerpoTabla = document.getElementById("base_datos_inventario");
            cuerpoTabla.innerHTML = "";

            if (datos.length === 0) {
                alert("No se encontró ningún elemento con el nombre: " + nombre);
                return;
            }

            datos.forEach((item) => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${item.codigo}</td>
                    <td>${item.Nombre_elemento}</td>
                    <td>${item.precio_unitario}</td>
                    <td>${item.cantidad_exis}</td>
                    <td>${(item.precio_unitario * 1.2)}</td>
                    <td>
                    <button type="button" onclick="actualizar(${item.codigo})">🔄</button>
                    <button type="button" onclick="eliminar(${item.codigo})">❌</button>
                    </td>
                `;
                cuerpoTabla.appendChild(fila);
            });
        } else {
            alert("Error en la búsqueda");
        }
    } catch (error) {
        console.error("Error buscando elemento:", error);
    }
}

// Facturación

// Buscar por nombre para facturación
async function buscarPorNombre() {
    const nombre = document.getElementById("buscar_nombre").value;
    if (!nombre) {
        alert("Ingrese un nombre");
        return;
    }
    try {
        const respuesta = await fetch('http://127.0.0.1:5000/buscarElementoNombre/'+nombre);
        if (respuesta.ok) {
            const datos = await respuesta.json();
            const cuerpoTabla = document.getElementById("base_datos_inventario");
            cuerpoTabla.innerHTML = "";

            if (datos.length == 0) {
                alert("No se encontró ningún elemento con el nombre: " +nombre);
                return;
            }

            datos.forEach((f) => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${f.codigo}</td>
                    <td>${f.Nombre_elemento}</td>
                    <td>${f.precio_unitario}</td>
                    <td class="cantidad">${f.cantidad_exis}</td> <!-- 👈 para actualizar después -->
                    <td>${(f.precio_unitario * 1.2)}</td>
                    <td>
                        <input type="number" id="cantidad_sol${f.codigo}" min="1" max="${f.cantidad_exis}">
                        <button onclick="agregarAlCarrito(${f.codigo}, '${f.Nombre_elemento}', ${f.precio_unitario}, ${f.cantidad_exis})">➕</button>
                    </td>
                `;
                cuerpoTabla.appendChild(fila);
            });

        } else {
            alert("Error en la búsqueda");
        }
    } catch (error) {
        console.error("Error buscando elemento:", error);
    }
}

// Agregar a la compra

function agregarAlCarrito(codigo, nombre, precio, stock) {
    const cantidad = parseInt(document.getElementById("cantidad_sol"+codigo).value);
    const precio_venta = precio * 1.2;

    if (!cantidad || cantidad <= 0) {
        alert("Cantidad inválida");
        return;
    }
    if (cantidad > stock) {
        alert("No hay suficiente stock");
        return;
    }
    // revisar si ya existe en el carrito
    const existente = carrito.find(item => item.codigo == codigo);
    if (existente) {
        if (existente.cantidad+cantidad > stock) {
            alert("No puedes superar el stock disponible");
            existente.cantidad = stock;
        } else {
            existente.cantidad += cantidad;
        }
    } else {
        carrito.push({codigo, nombre,precio_venta: precio, cantidad});
    }

    //alert("Producto agregado");
    console.log("Carrito actual:", carrito);
    mostrarCarrito();
}

// mostrar el carrito
function mostrarCarrito() {
    const tabla_carrito = document.getElementById("tabla_carrito");
    tabla_carrito.innerHTML = "";

    carrito.forEach((item, cant_act) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <tr>
                <td>${item.codigo}</td>
                <td>${item.nombre}</td>
                <td>
                    <button onclick="cambiarCantidad(${cant_act},-1)">➖</button>
                    ${item.cantidad}
                    <button onclick="cambiarCantidad(${cant_act},1)">➕</button>
                </td>
                <td>${item.precio_venta.toFixed(2)}</td>
                <td>${(item.cantidad*item.precio_venta)}</td>
                <td><button onclick="eliminarDelCarrito(${cant_act})">❌</button></td>
            </tr>
        `;
        tabla_carrito.appendChild(fila);
    });
}

// cambiar cantidad de un producto
function cambiarCantidad(cant_act, nue_cant) {
    const item = carrito[cant_act];
    // si es aumentar, validar stock
    if (nue_cant == 1 && item.cantidad >= item.stock) {
        alert("No puedes agregar más, alcanzaste el stock disponible");
        return;
    }
    item.cantidad += nue_cant;

    if (item.cantidad <= 0) {
        carrito.splice(cant_act, 1);
    }

    mostrarCarrito();
    console.log("Carrito actualizado:", carrito);
}

// eliminar producto del carrito
function eliminarDelCarrito(cant_act) {
    carrito.splice(cant_act, 1);
    mostrarCarrito();
    console.log("Carrito actualizado:", carrito);
}

// generar factura a partir del carrito
async function generarFacturaMultiple() {
    if (carrito.length == 0) {
        alert("El carrito está vacío, no puedes generar factura.");
        return;
    }

    let fecha = new Date().toLocaleString("es-ES"); // fecha en español

    try {
        const response = await fetch("http://127.0.0.1:5000/crearFactura", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productos: carrito })
        });

        if (!response.ok) throw new Error("Error al generar factura");

        const factura = await response.json();
        console.log("Factura creada:", factura);

        // agregar fila al historial
        const tabla = document.getElementById("Tabla_facturas");
        const fila = tabla.insertRow();
        fila.innerHTML = `
            <td>${factura.id || "-"}</td>
            <td>${factura.total_factura}</td>
            <td>${fecha}</td>
            <td><button onclick="mostrarFacturaCompletaBackend(${factura.id || 0})">🔍 Ver Detalle</button></td>
        `;

        carrito = [];
        mostrarCarrito();
        //alert("Factura creada exitosamente ✅");
                
    } catch (error) {
        console.error("Error generando factura:", error);
    }
}
async function cargarFacturasGuardadas() {
    try {
        const response = await fetch("http://127.0.0.1:5000/datosFacturas");
        const facturas = await response.json();

        const tabla = document.getElementById("Tabla_facturas");
        tabla.innerHTML = "";

        facturas.forEach(f => {
            const fila = tabla.insertRow();
            fila.innerHTML = `
                <td>${f.id}</td>
                <td>${f.total_factura}</td>
                <td>${new Date(f.fecha).toLocaleString("es-ES")}</td>
                <td><button onclick="mostrarFacturaCompletaBackend(${f.id})">🔍 Ver Detalle</button></td>
            `;
            tabla.appendChild(fila);
        });
    } catch (error) {
        console.error("Error cargando facturas:", error);
    }
}

//mostrar una factura completa en el div "recibo"
async function mostrarFacturaCompletaBackend(id) {
    const response = await fetch(`http://127.0.0.1:5000/detalleFactura/${id}`);
    const detalle = await response.json();

    let html = `<h3>🧾 Factura N° ${id}</h3>
                <table border="1">
                <thead>
                    <tr><th>Código</th><th>Nombre</th><th>Cantidad</th><th>Precio</th><th>Total</th></tr>
                </thead><tbody>`;

    detalle.forEach(item => {
        html += `<tr>
            <td>${item.codigo}</td>
            <td>${item.Nombre_elemento}</td>
            <td>${item.cantidad}</td>
            <td>${item.precio_unitario}</td>
            <td>${item.total}</td>
        </tr>`;
    });

    html += "</tbody></table>";
    document.getElementById("recibo").innerHTML = html;
}

function nuevaCompra() {
    carrito = [];
    mostrarCarrito();
    document.getElementById("recibo").innerHTML = "";
    alert("Listo para una nueva compra 🛒");
}

function enviarFactura(id) {
    alert(`Factura N° ${id} enviada exitosamente 📤`);
    console.log("📤 Factura enviada:", id);
}

async function cargarVentas(){
    let inicio = document.getElementById("fecha_inicio").value;
    let fin = document.getElementById("fecha_fin").value;

    let url = "http://127.0.0.1:5000/datosVentas";
    let params = [];

    if (inicio) params.push("fecha_inicio=" + inicio);
    if (fin) params.push("fecha_fin=" + fin);

    if (params.length > 0){
        url += "?" + params.join("&");
    }

    const res = await fetch(url);
    const datos = await res.json();
    const tbody = document.getElementById("tablaVentas");
    tbody.innerHTML = "";

    let totalGeneral = 0;

    if (datos.length === 0){
        tbody.innerHTML = "<tr><td colspan='6'>❌ No hay ventas en este rango</td></tr>";
        document.getElementById("resumenVentas").innerText = "📊 Total en rango: $0.00";
        return;
    }

    datos.forEach(v => {
        const fila = `<tr>
            <td>${v.id}</td>
            <td>${v.codigo}</td>
            <td>${v.Nombre_elemento}</td>
            <td>${v.cantidad_vendida}</td>
            <td>$${parseFloat(v.total).toFixed(2)}</td>
            <td>${new Date(v.fecha).toLocaleString("es-CO")}</td>
        </tr>`;
        tbody.innerHTML += fila;

        totalGeneral += parseFloat(v.total);
    });

    // Mostrar resumen
    document.getElementById("resumenVentas").innerText =
        "📊 Total en rango: $" + totalGeneral.toFixed(2);
}

function limpiarFiltro(){
    document.getElementById("fecha_inicio").value = "";
    document.getElementById("fecha_fin").value = "";
    cargarVentas();
}

document.addEventListener("DOMContentLoaded", cargarVentas);
document.addEventListener("DOMContentLoaded", cargarFacturasGuardadas);
document.addEventListener('DOMContentLoaded', cargarDatosInventario);
