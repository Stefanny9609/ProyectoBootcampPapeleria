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

            if (datos.length === 0) {
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
                        <button onclick="generarFactura(${f.codigo})">🧾 Facturar</button>
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
// Generar factura
async function generarFactura(codigo) {
    const cantidad = parseInt(document.getElementById("cantidad_sol" + codigo).value);
    if (!cantidad || cantidad <= 0) {
        alert("Ingrese una cantidad válida");
        return;
    }

    try {
        const respuesta = await fetch('http://127.0.0.1:5000/crearFactura', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({codigo: codigo, cantidad: cantidad})
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            alert(data.mensaje);
            cargarFacturas();
            cargarDatosInventario(); // refrescar stock
        } else {
            alert("Error: " + (data.error || "No se pudo facturar"));
        }
    } catch (error) {
        console.error("Error generando factura:", error);
    }
}

// Cargar facturas
async function cargarFacturas() {
    try {
        const respuesta = await fetch('http://127.0.0.1:5000/datosFacturas');
        const facturas = await respuesta.json();
        const cuerpoTabla = document.getElementById("tablaFacturas");
        cuerpoTabla.innerHTML = "";

        facturas.forEach((f) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${f.id}</td>
                <td>${f.codigo}</td>
                <td>${f.Nombre_elemento}</td>
                <td>${f.cantidad}</td>
                <td>${f.precio_unitario}</td>
                <td>${f.total}</td>
                <td>${f.fecha}</td>
            `;
            cuerpoTabla.appendChild(fila);
        });
    } catch (error) {
        console.error("Error cargando facturas:", error);
    }
}

document.addEventListener('DOMContentLoaded',cargarFacturas);
document.addEventListener('DOMContentLoaded', cargarDatosInventario);
