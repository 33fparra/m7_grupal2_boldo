//falta tirarlo como arreglo

import pkg from 'pg';  //no me funciono cono el { Pool } decia que era de la version CommonJs 
const { Pool } = pkg;

// 1. Realizar la conexión con Base de Datos
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'pipe1234',
  database: 'postgres',
  port: 5432,
  max: 20, // máximo de 20 clientes
  idleTimeoutMillis: 5000, // 5 segundos de inactividad
  connectionTimeoutMillis: 2000, // 2 segundos de espera
});

// Función para realizar consultas / querText toma la consulta de SQL a ejecuar / queryParams es un array con los valores que se van a insertar
async function queryDatabase(queryText, queryParams) {  
  const client = await pool.connect(); // creamos la conexion

  try {
    // 2. Hacer todas las consultas con un JSON como argumento // tiene tres propiedades
    const name = 'query-name';
    const query = {
      name,
      text: queryText,
      values: queryParams,
    };

    // 3. Hacer las consultas con texto parametrizado
    const res = await client.query(query);

    //res ya tiene la query, y el res.rows es prue la respuesta sea mas corta colo un segmento(lo q ue necesito)

    // 7. Obtener el registro de los estudiantes registrados en formato de arreglos
    return res.rows;
  } catch (err) {
    // 5. Capturar los posibles errores en todas las consultas
    console.error(err);   // si hay un error se registraen la consola
  } finally {
    // 4. Liberar a un cliente al concluir su consulta
    client.release(); //este no entiendo mucho que monos pinta, lo repsare, l oestoy colocando solo de forma automatica
  }
}

// Función para agregar un nuevo estudiante
async function agregarEstudiante(id, nombre, rut, curso, nivel) {
  const queryText = `
    INSERT INTO estudiantes (id, nombre, rut, curso, nivel)
    VALUES ($1, $2, $3, $4, $5)
  `;
  const queryParams = [id, nombre, rut, curso, nivel];
  await queryDatabase(queryText, queryParams);
  console.log('Estudiante', nombre, 'Agregado con éxito');
}

// Función para consultar todos los estudiantes
async function consultarEstudiantes() {
  const queryText = 'SELECT * FROM estudiantes';
  const res = await queryDatabase(queryText, []);
  console.log('Registro actual', res);
}

// Función para consultar un estudiante por rut
async function consultarEstudiantePorRut(rut) {
  const queryText = 'SELECT * FROM estudiantes WHERE rut = $1';
  const res = await queryDatabase(queryText, [rut]);
  console.log(res);
}

// Función para editar los datos de un estudiante
async function editarEstudiante(id, nombre, rut, curso, nivel) {
  const queryText = `
    UPDATE estudiantes
    SET nombre = $2, curso = $3, nivel = $4
    WHERE rut = $1
  `;
  const queryParams = [rut, nombre, curso, nivel];
  await queryDatabase(queryText, queryParams);
  console.log('Estudiante', nombre, 'editado con éxito');
}

// Función para eliminar un estudiante por rut
async function eliminarEstudiantePorRut(rut) {
  const queryText = 'DELETE FROM estudiantes WHERE rut = $1';
  await queryDatabase(queryText, [rut]);
  console.log('Registro de estudiante con rut', rut, 'eliminado');
}

// Aca manejamos los comandos de la línea de comandos
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'nuevo':
      const nuevoArgs = process.argv.slice(3);
      await agregarEstudiante(...nuevoArgs);
      break;
    case 'consulta':
      await consultarEstudiantes();
      break;
    case 'editar':
      const editarArgs = process.argv.slice(3);
      await editarEstudiante(...editarArgs);
      break;
    case 'rut':
      const rutArg = process.argv[3];
      await consultarEstudiantePorRut(rutArg);
      break;
    case 'eliminar':
      const eliminarArg = process.argv[3];
      await eliminarEstudiantePorRut(eliminarArg);
      break;
    default:
      console.log('Comando no reconocido');
      break;
  }

  await pool.end();
}

// Ejecutar la aplicación
main().catch((error) => {
  // 6. Retornar por consola un mensaje de error en caso de haber problemas de conexión
  console.error('Error en la aplicación', error);
});

