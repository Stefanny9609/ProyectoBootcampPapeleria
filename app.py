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

# FACTURACION
@app.route('/facturacion')
def factura():
    return render_template('facturacion.html')

@app.route('/buscarElementoNombre/<nombre>', methods=['GET'])
def buscar_nombre(nombre):
    cursor.execute("SELECT * FROM inventario WHERE Nombre_elemento LIKE %s", ("%" + nombre + "%",))
    resultadoElemento = cursor.fetchall()
    return jsonify(resultadoElemento)

@app.route('/crearFactura', methods=['POST'])
def crear_factura():
    datos = request.json
    productos = datos['productos']

    if not productos:
        return jsonify({"error": "No se enviaron productos"}), 400

    total_factura = 0

    cursor.execute("INSERT INTO facturas (total_factura) VALUES (0)")  
    factura_id = cursor.lastrowid  #es útil para obtener el ID único de una nueva fila que ha sido insertada en una tabla con una columna de clave primaria autoincrementada. 

    # Insertar detalle
    for p in productos:
        codigo = p['codigo']
        cantidad = p['cantidad']

        cursor.execute("SELECT * FROM inventario WHERE codigo=%s", (codigo,))
        producto = cursor.fetchone()  #Capta la siguiente fila (caso) del conjunto de datos activo.

        if not producto:
            return jsonify({"error": f"Producto con código {codigo} no encontrado"}), 404
        if producto['cantidad_exis'] < cantidad:
            return jsonify({"error": f"Stock insuficiente para {producto['Nombre_elemento']}"}), 400

        precio_unitario = producto['precio_unitario']
        subtotal = precio_unitario * cantidad
        total_factura += subtotal

        cursor.execute(
            "INSERT INTO detalle_factura (factura_id, codigo, cantidad, precio_unitario, total) VALUES (%s,%s,%s,%s,%s)",
            (factura_id, codigo, cantidad, precio_unitario, subtotal)
        )

        # Actualizar inventario
        cursor.execute("UPDATE inventario SET cantidad_exis = cantidad_exis - %s WHERE codigo=%s", (cantidad, codigo))

    # 3️⃣ Actualizar total en cabecera
    cursor.execute("UPDATE facturas SET total_factura=%s WHERE id=%s", (total_factura, factura_id))

    db.commit()

    return jsonify({
        "id": factura_id,
        "total_factura": total_factura
    })

@app.route('/detalleFactura/<int:factura_id>', methods=['GET'])
def detalle_factura(factura_id):
    cursor.execute("""
        SELECT d.codigo, i.Nombre_elemento, d.cantidad, d.precio_unitario, d.total
        FROM detalle_factura d
        JOIN inventario i ON d.codigo=i.codigo
        WHERE d.factura_id=%s
    """, (factura_id,))
    detalle = cursor.fetchall()
    return jsonify(detalle)

@app.route('/datosFacturas', methods=['GET'])
def datos_facturas():
    cursor.execute("SELECT * FROM facturas ORDER BY fecha DESC")
    facturas = cursor.fetchall()
    return jsonify(facturas)

#Ventas
@app.route('/Ventas')
def ver_ventas():
    return render_template('ventas.html')

@app.route("/datosVentas")
def datos_ventas():
    fecha_inicio = request.args.get("fecha_inicio")
    fecha_fin = request.args.get("fecha_fin")

    query = """
        SELECT df.id,
               i.codigo,
               i.Nombre_elemento,
               df.cantidad AS cantidad_vendida,
               df.total AS total,
               f.fecha AS fecha
        FROM detalle_factura df
        JOIN inventario i ON df.codigo = i.codigo
        JOIN facturas f ON df.factura_id = f.id
        WHERE 1=1
    """
    params = []

    if fecha_inicio:
        query += " AND DATE(f.fecha) >= %s"
        params.append(fecha_inicio)
    if fecha_fin:
        query += " AND DATE(f.fecha) <= %s"
        params.append(fecha_fin)

    query += " ORDER BY f.fecha DESC"

    cursor.execute(query, tuple(params))
    ventas = cursor.fetchall()
    return jsonify(ventas)


if __name__ == '__main__':
    app.run(debug=True)