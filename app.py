import mysql.connector
from flask import Flask, render_template,jsonify,request
from flask_cors import CORS

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

    
if __name__ == '__main__':
    app.run(debug=True)