let carrito = [];

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
                    <button type="button" onclick="actualizar(${item.codigo})">Actualizar</button>
                    <button type="button" onclick="eliminar(${item.codigo})">Eliminar</button>
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
                    <button type="button" onclick="actualizar(${item.codigo})">Actualizar</button>
                    <button type="button" onclick="eliminar(${item.codigo})">Eliminar</button>
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
// ------------Facturación

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
                    <td>${f.cantidad_exis}</td>
                    <td>${(f.precio_unitario * 1.2)}</td>
                    <td>
                        <input type="number" id="cantidad_sol${f.codigo}" min="1" max="${f.cantidad_exis}" style="width:70px;">
                        <button onclick="agregarAlCarrito(${f.codigo}, '${f.Nombre_elemento}', ${f.precio_unitario*1.2}, ${f.cantidad_exis})">➕</button>

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

/*// Agregar al carrito
function agregarAlCarrito(codigo, nombre, precio, stock) {
    const cantidad = parseInt(document.getElementById("cantidad_sol" +codigo).value);
    if (!cantidad || cantidad <= 0) {
        alert("Cantidad inválida");
        return;
    }
    if (cantidad > stock) {
        alert("No hay suficiente stock");
        return;
    }
    
    carrito.push({codigo, nombre, precio_unitario: precio, cantidad});
    alert("Producto agregado a la factura");
}

// Generar factura con todo el carrito
async function generarFacturaMultiple() {
    if (carrito.length == 0) {
        alert("No hay productos en la factura");
        return;
    }

    try {
        const respuesta = await fetch('http://127.0.0.1:5000/crearFactura', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({productos: carrito})
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            alert("Factura generada con éxito. Total: " + data.total_factura);
            carrito = []; // limpiar carrito
            cargarFacturas();
            cargarDatosInventario();
            generarReciboHTML(data); // <<--- crear recibo visual
        } else {
            alert("Error: " + (data.error || "No se pudo facturar"));
        }
    } catch (error) {
        console.error("Error generando factura:", error);
    }
}

// Generar recibo en el mismo HTML
function generarReciboHTML(data) {
    let html = `
        <div style="font-family: monospace; border:1px solid #000; padding:10px; margin-top:20px; width:350px;">
            <h2>📐 PAPELERÍA S&J</h2>
            <p>Fecha: ${new Date().toLocaleString()}</p>
            <hr>
            <table border="1" cellspacing="0" cellpadding="5" width="100%">
                <tr><th>Código</th><th>Nombre</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr>`;
    
    data.detalles.forEach(p => {
        html += `<tr>
            <td>${p.codigo}</td>
            <td>${p.nombre}</td>
            <td>${p.cantidad}</td>
            <td>${p.precio_unitario}</td>
            <td>${p.subtotal}</td>
        </tr>`;
    });

    html += `
            </table>
            <h3>Total: $${data.total_factura}</h3>
            <hr>
            <p>¡Gracias por su compra!</p>
        </div>
    `;

    // Insertar recibo en el contenedor de la página
    document.getElementById("recibo").innerHTML = html;
}

// Cargar todas las facturas registradas
async function cargarFacturas() {
    try {
        const respuesta = await fetch("http://127.0.0.1:5000/datosFacturas");
        if (respuesta.ok) {
            const facturas = await respuesta.json();
            const cuerpoTabla = document.getElementById("tablaFacturas");
            cuerpoTabla.innerHTML = "";

            facturas.forEach(f => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${f.id}</td>
                    <td>${f.codigo}</td>
                    <td>${f.Nombre_elemento}</td>
                    <td>${f.cantidad}</td>
                    <td>${f.precio_unitario*1.2}</td>
                    <td>${f.total}</td>
                    <td>${f.fecha}</td>
                `;
                cuerpoTabla.appendChild(fila);
            });
        } else {
            console.error("Error cargando facturas");
        }
    } catch (error) {
        console.error("Error al obtener facturas:", error);
    }
}

*/

//document.addEventListener('DOMContentLoaded', cargarFacturas);
document.addEventListener('DOMContentLoaded', cargarDatosInventario);
