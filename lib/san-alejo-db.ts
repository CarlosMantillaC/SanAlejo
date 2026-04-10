import * as SQLite from 'expo-sqlite';

export type Contenedor = {
  id: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
};

export type Objeto = {
  id: number;
  nombre: string;
  descripcion: string;
  id_contenedor: number;
};

export type ContenedorInput = Omit<Contenedor, 'id'>;
export type ObjetoInput = Omit<Objeto, 'id' | 'id_contenedor'>;

type TotalResult = { total: number };

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

const CREATE_TABLES_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS contenedor (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  ubicacion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS objeto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  id_contenedor INTEGER NOT NULL,
  FOREIGN KEY (id_contenedor) REFERENCES contenedor(id) ON DELETE CASCADE
);
`;

const SAMPLE_DATA: (ContenedorInput & { objetos: ObjetoInput[] })[] = [
  {
    nombre: 'Caja cocina',
    descripcion: 'Electrodomésticos y utensilios que no uso seguido',
    ubicacion: 'Alacena superior cocina',
    objetos: [
      { nombre: 'Waflera', descripcion: 'Waflera eléctrica marca Oster, funciona bien' },
      {
        nombre: 'Moldes navideños',
        descripcion: 'Moldes de galletas en forma de estrella y árbol',
      },
      { nombre: 'Exprimidor', descripcion: 'Exprimidor de naranjas manual, color verde' },
    ],
  },
  {
    nombre: 'Maleta ropa invierno',
    descripcion: 'Ropa de clima frío que solo uso en viajes',
    ubicacion: 'Closet cuarto principal, parte de arriba',
    objetos: [
      { nombre: 'Chaqueta negra', descripcion: 'Chaqueta North Face talla M' },
      { nombre: 'Bufanda gris', descripcion: 'Bufanda de lana tejida' },
      { nombre: 'Guantes', descripcion: 'Guantes térmicos negros' },
      { nombre: 'Gorro de lana', descripcion: 'Gorro azul oscuro con pompón' },
    ],
  },
  {
    nombre: 'Cajón cables',
    descripcion: 'Cables, cargadores y adaptadores varios',
    ubicacion: 'Escritorio, segundo cajón',
    objetos: [
      { nombre: 'Cable HDMI', descripcion: 'Cable HDMI 2 metros, negro' },
      { nombre: 'Cargador Samsung viejo', descripcion: 'Cargador micro USB, funciona' },
      { nombre: 'Adaptador USB-C', descripcion: 'Adaptador USB-C a USB-A' },
    ],
  },
];

async function seedInitialData(database: SQLite.SQLiteDatabase) {
  const count = await database.getFirstAsync<TotalResult>(
    'SELECT COUNT(*) as total FROM contenedor'
  );

  if ((count?.total ?? 0) > 0) {
    return;
  }

  await database.withTransactionAsync(async () => {
    for (const contenedor of SAMPLE_DATA) {
      const insertContenedorResult = await database.runAsync(
        'INSERT INTO contenedor (nombre, descripcion, ubicacion) VALUES (?, ?, ?)',
        contenedor.nombre,
        contenedor.descripcion,
        contenedor.ubicacion
      );

      const contenedorId = Number(insertContenedorResult.lastInsertRowId);

      for (const objeto of contenedor.objetos) {
        await database.runAsync(
          'INSERT INTO objeto (nombre, descripcion, id_contenedor) VALUES (?, ?, ?)',
          objeto.nombre,
          objeto.descripcion,
          contenedorId
        );
      }
    }
  });
}

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = (async () => {
      const database = await SQLite.openDatabaseAsync('sanalejo.db');
      await database.execAsync(CREATE_TABLES_SQL);
      await seedInitialData(database);
      return database;
    })();
  }

  return databasePromise;
}

export async function getContenedores() {
  const db = await getDatabase();
  return db.getAllAsync<Contenedor>('SELECT * FROM contenedor ORDER BY id DESC');
}

export async function getContenedorById(id: number) {
  const db = await getDatabase();
  return db.getFirstAsync<Contenedor>('SELECT * FROM contenedor WHERE id = ?', id);
}

export async function createContenedor(input: ContenedorInput) {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO contenedor (nombre, descripcion, ubicacion) VALUES (?, ?, ?)',
    input.nombre,
    input.descripcion,
    input.ubicacion
  );
  return Number(result.lastInsertRowId);
}

export async function updateContenedor(id: number, input: ContenedorInput) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE contenedor SET nombre = ?, descripcion = ?, ubicacion = ? WHERE id = ?',
    input.nombre,
    input.descripcion,
    input.ubicacion,
    id
  );
}

export async function deleteContenedor(id: number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM contenedor WHERE id = ?', id);
}

export async function getObjetosByContenedorId(idContenedor: number) {
  const db = await getDatabase();
  return db.getAllAsync<Objeto>(
    'SELECT * FROM objeto WHERE id_contenedor = ? ORDER BY id DESC',
    idContenedor
  );
}

export async function getObjetoById(id: number) {
  const db = await getDatabase();
  return db.getFirstAsync<Objeto>('SELECT * FROM objeto WHERE id = ?', id);
}

export async function createObjeto(idContenedor: number, input: ObjetoInput) {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO objeto (nombre, descripcion, id_contenedor) VALUES (?, ?, ?)',
    input.nombre,
    input.descripcion,
    idContenedor
  );
  return Number(result.lastInsertRowId);
}

export async function updateObjeto(id: number, input: ObjetoInput) {
  const db = await getDatabase();
  await db.runAsync('UPDATE objeto SET nombre = ?, descripcion = ? WHERE id = ?', input.nombre, input.descripcion, id);
}

export async function deleteObjeto(id: number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM objeto WHERE id = ?', id);
}

export async function initDatabase() {
  await getDatabase();
}
