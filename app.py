import mysql.connector
from flask import Flask, render_template,jsonify,request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

resultadosElementos = []

db = mysql.connector.connect(
    host="localhost",
    user="root",           
    password="1053587088Nobs@",     
    database="papeleria" 
)
cursor = db.cursor(dictionary=True)

query = "SELECT * FROM inventario"

@app.route('/inicio')
def inicio():
    return render_template('inicio.html')

@app.route('/inventario')
def datos_inventario():
    return render_template('inventario.html')

@app.route('/datosInventario',methods=['GET'])
def inventario():
    cursor.execute(query)
    resultadosElementos = cursor.fetchall()
    return resultadosElementos 

@app.route('/añadirElemento',methods=['POST'])
def añadir_elemento():
    nuevoElemento = request.json.get('elemento')
    resultadosElementos.append(nuevoElemento)
    cursor.execute("INSERT INTO inventario (codigo,Nombre_elemento,cantidad_exis,precio_unitario) VALUES(%s,%s,%s,%s)",
    (nuevoElemento['codigo'], nuevoElemento['Nombre_elemento'], nuevoElemento['cantidad_exis'], nuevoElemento['precio_unitario']))
    db.commit()
    return 'Se agrego un nuevo elemento'

@app.route('/buscarElemento/<codigo>',methods=['GET'])
def buscar(codigo):
    cursor.execute("SELECT *from inventario WHERE codigo = %s", (codigo,))
    resultadoElemento=cursor.fetchall()
    return jsonify(resultadoElemento)

@app.route('/buscarElementoNombre/<nombre>', methods=['GET'])
def buscar_nombre(nombre):
    cursor.execute("SELECT * FROM inventario WHERE Nombre_elemento LIKE %s", ("%" + nombre + "%",))
    resultadoElemento = cursor.fetchall()
    return jsonify(resultadoElemento)

@app.route('/actualizarElemento/<codigo>', methods=['PUT'])
def actualizar(codigo):
    datos_nuevos=request.json
    cursor.execute("UPDATE inventario SET Nombre_elemento=%s, cantidad_exis=%s, precio_unitario=%s WHERE codigo=%s",
    (datos_nuevos['Nombre_elemento'], datos_nuevos['cantidad_exis'], datos_nuevos['precio_unitario'],codigo))
    db.commit()
    return "Elemento actualizado"

@app.route('/eliminarElemento/<codigo>',methods=['DELETE'])
def eliminar(codigo):
    cursor.execute("DELETE FROM inventario WHERE codigo=%s",(codigo,))
    db.commit()
    return "Elemento eliminado"


@app.route('/Ventas')
def ver_ventas():
    return render_template('ventas.html')

@app.route('/facturacion')
def factura():
    return render_template('facturacion.html')

@app.route('/crearFactura', methods=['POST'])
def crear_factura():
    datos = request.json  # ahora será {"productos": [...]} 
    productos = datos['productos']

    if not productos or len(productos) == 0:
        return jsonify({"error": "No se enviaron productos"}), 400

    total_factura = 0
    detalles = []

    for p in productos:
        codigo = p['codigo']
        cantidad = p['cantidad']

        cursor.execute("SELECT * FROM inventario WHERE codigo=%s", (codigo,))
        producto = cursor.fetchone()

        if not producto:
            return jsonify({"error": f"Producto con código {codigo} no encontrado"}), 404
        if producto['cantidad_exis'] < cantidad:
            return jsonify({"error": f"Stock insuficiente para {producto['Nombre_elemento']}"}), 400

        precio_unitario = producto['precio_unitario']
        subtotal = precio_unitario * cantidad
        total_factura += subtotal

        # Guardar detalle
        cursor.execute(
            "INSERT INTO facturacion (codigo, cantidad, precio_unitario, total) VALUES (%s,%s,%s,%s)",
            (codigo, cantidad, precio_unitario, subtotal)
        )

        # Insertar en ventas
        cursor.execute(
            "INSERT INTO ventas (codigo, cantidad_vendida, total) VALUES (%s,%s,%s)",
            (codigo, cantidad, subtotal)
        )

        # Actualizar inventario
        cursor.execute(
            "UPDATE inventario SET cantidad_exis = cantidad_exis - %s WHERE codigo=%s",
            (cantidad, codigo)
        )

        detalles.append({
            "codigo": codigo,
            "nombre": producto['Nombre_elemento'],
            "cantidad": cantidad,
            "precio_unitario": precio_unitario,
            "subtotal": subtotal
        })

    db.commit()

    return jsonify({
        "mensaje": "Factura creada con éxito",
        "total_factura": total_factura,
        "detalles": detalles
    })


# ---------- API CONSULTAR ----------
@app.route('/datosVentas', methods=['GET'])
def datos_ventas():
    cursor.execute("SELECT v.id, v.codigo, i.Nombre_elemento, v.cantidad_vendida, v.total, v.fecha FROM ventas v JOIN inventario i ON v.codigo=i.codigo")
    ventas = cursor.fetchall()
    return jsonify(ventas)

@app.route('/datosFacturas', methods=['GET'])
def datos_facturas():
    cursor.execute("SELECT f.id, f.codigo, i.Nombre_elemento, f.cantidad, f.precio_unitario, f.total, f.fecha FROM facturacion f JOIN inventario i ON f.codigo=i.codigo")
    facturas = cursor.fetchall()
    return jsonify(facturas)

 
if __name__ == '__main__':
    app.run(debug=True)