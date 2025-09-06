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
async function registrarElemento() {
    //event.preventDefault();
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
}

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

            if (datos.length == 0) {
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
async function cargarAlertasStock() {
    try {
        const respuesta = await fetch("http://127.0.0.1:5000/productosBajoStock");
        const productos = await respuesta.json();
        const div = document.getElementById("alertas_stock");
        div.innerHTML = "";

        if (productos.length === 0) {
            div.innerHTML = "<p>✅ No hay productos en riesgo de agotarse.</p>";
            return;
        }

        let html = "<ul>";
        productos.forEach(p => {
            html += `<li>⚠️ ${p.Nombre_elemento} — Stock: ${p.cantidad_exis}</li>`;
        });
        html += "</ul>";
        div.innerHTML = html;

    } catch (error) {
        console.error("Error cargando alertas de stock:", error);
    }
}

// Facturación

// Buscar por nombre para facturación
async function buscarPorNombre() {
    const nombre = document.getElementById("buscarPorNombre").value;
    if (!nombre) {
        alert("Ingrese un nombre");
        return;
    }
    try {
        const respuesta = await fetch('http://127.0.0.1:5000/buscarElementoNombre/'+nombre);
        if (respuesta.ok) {
            const datos = await respuesta.json();
            const cuerpoTabla = document.getElementById("tabla_busqueda");
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

// Agregar
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
        carrito.push({codigo, nombre,precio_venta, cantidad});
    }

    //alert("Producto agregado");
    console.log("Carrito actual:", carrito);
    mostrarCarrito();
}

// mostrar el carrito
function mostrarCarrito() {
    
    const tabla_carrito = document.getElementById("tabla_carrito");
    tabla_carrito.innerHTML = "";
    const Titulo = document.createElement('h2'); // Puedes usar 'h1', 'h3', etc.
    Titulo.textContent = "🛒 CARRITO";
    tabla_carrito.append(Titulo);
    const encabezado = document.createElement("tr");
    encabezado.innerHTML = `
        <th>Código</th>
        <th>Nombre</th>
        <th>Cantidad</th>
        <th>Precio Unitario</th>
        <th>Total</th>
        <th>Acciones</th>
    `;
    tabla_carrito.appendChild(encabezado);
    carrito.forEach((item, cant_act) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${item.codigo}</td>
            <td>${item.nombre}</td>
            <td>
                <button onclick="cambiarCantidad(${cant_act},-1)">➖</button>
                ${item.cantidad}
                <button onclick="cambiarCantidad(${cant_act},1)">➕</button>
            </td>
            <td>${item.precio_venta}</td>
            <td>${(item.cantidad*item.precio_venta)}</td>
            <td><button onclick="eliminarDelCarrito(${cant_act})">❌</button></td>
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

    try {
        const response = await fetch("http://127.0.0.1:5000/crearFactura", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productos: carrito })
        });

        if (!response.ok) throw new Error("Error al generar factura");

        const factura = await response.json();
        console.log("Factura creada:", factura);

        await mostrarFacturaCompletaBackend(factura.id);

        const acciones = `
            <br>
            <button onclick="enviarFactura(${factura.id})">📤 Enviar</button>
            <button onclick="imprimirFactura(${factura.id})">🖨️ Imprimir</button>
        `;
        document.getElementById("recibo").innerHTML += acciones;

        // Vaciar carrito
        carrito = [];
        mostrarCarrito();
        cargarFacturasGuardadas();

    } catch (error) {
        console.error("Error generando factura:", error);
    }
}

function enviarFactura(id) {
    alert(`Factura N° ${id} enviada exitosamente 📤`);
    console.log("📤 Factura enviada:", id);
}

function imprimirFactura(id) {
    alert(`Factura N° ${id} enviada a impresión 🖨️`);
    console.log("🖨️ Factura impresa:", id);
}

//mostrar una factura completa en el div "recibo"
async function mostrarFacturaCompletaBackend(id) {
    const response = await fetch(`http://127.0.0.1:5000/detalleFactura/`+id);
    const detalle = await response.json();

    let html = `<h3>🧾 Factura N° ${id}</h3>
                <table>
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
    location.reload();
}
// Mostrar facturas
async function mostrarFacturas() {
    try {
        const response = await fetch("http://127.0.0.1:5000/datosFacturas");
        const facturas = await response.json();

        let html = `
            <h2>📋 Facturas Registradas</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Total General</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        facturas.forEach(f => {
            html += `
                <tr>
                    <td>${f.id}</td>
                    <td>${f.total_factura}</td>
                    <td>${new Date(f.fecha).toLocaleString("es-ES")}</td>
                    <td><button onclick="mostrarFacturaCompletaBackend(${f.id})">🔍</button></td>
                </tr>
            `;
        });

        html += "</tbody></table><div id='recibo'></div>";
        document.getElementById("vistaVentas").innerHTML = html;

    } catch (error) {
        console.error("Error cargando facturas:", error);
    }
}

// Mostrar TODAS las ventas
async function mostrarVentas() {
    try {
        const response = await fetch("http://127.0.0.1:5000/todasLasVentas");
        const ventas = await response.json();

        let totalGeneral = 0;

        let html = `
            <h2>🛒 Detalle de Todas las Ventas</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID Factura</th>
                        <th>Fecha</th>
                        <th>Producto</th>
                        <th>Código</th>
                        <th>Cantidad</th>
                        
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
        `;

        ventas.forEach(v => {
            let subtotal = Number(v.total) || 0;
            totalGeneral += subtotal;

            html += `
                <tr>
                    <td>${v.factura_id}</td>
                    <td>${new Date(v.fecha).toLocaleString("es-ES")}</td>
                    <td>${v.Nombre_elemento}</td>
                    <td>${v.codigo}</td>
                    <td>${v.cantidad}</td>
                    
                    <td>${subtotal}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;

        // Recuadro con total general
        html += `
            <div>
                💵 TOTAL GENERAL DE VENTAS: ${totalGeneral}
            </div>
        `;

        document.getElementById("vistaVentas").innerHTML = html;

    } catch (error) {
        console.error("Error cargando ventas:", error);
    }
}
async function cargarGraficos() {
    // Ventas por día
    const res1 = await fetch("http://127.0.0.1:5000/ventasPorDia");
    const ventas = await res1.json();
    const ctx1 = document.getElementById('graficoVentasDia').getContext('2d');
    new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: ventas.map(v => v.dia),
            datasets: [{
                label: 'Ventas ($)',
                data: ventas.map(v => v.total_ventas)
            }]
        }
    });

    // Productos más vendidos
    const res2 = await fetch("http://127.0.0.1:5000/productosMasVendidos");
    const productos = await res2.json();
    const ctx2 = document.getElementById('graficoProductos').getContext('2d');
    new Chart(ctx2, {
        type: 'pie',
        data: {
            labels: productos.map(p => p.Nombre_elemento),
            datasets: [{
                label: 'Cantidad vendida',
                data: productos.map(p => p.total_vendido)
            }]
        }
    });
}

document.addEventListener("DOMContentLoaded", cargarGraficos);
document.addEventListener("DOMContentLoaded", mostrarFacturas);
document.addEventListener("DOMContentLoaded",cargarAlertasStock);
document.addEventListener("DOMContentLoaded", cargarDatosInventario);
