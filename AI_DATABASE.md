# PlaceAndNumbers - Base de Datos (Supabase/PostgreSQL)

## Esquema

Ejecutar en SQL Editor de Supabase: `supabase/schema.sql`

### Tabla: `prospects`

| Columna | Tipo | Default | Notas |
|---|---|---|---|
| id | UUID | `gen_random_uuid()` | PRIMARY KEY |
| user_id | UUID | - | FK -> `auth.users(id)` ON DELETE CASCADE |
| place_id | TEXT | - | ID de Google Places |
| name | TEXT | - | NOT NULL |
| category | TEXT | - | Ej: "Hotel", "Restaurante" |
| address | TEXT | - | Dirección formateada |
| phone | TEXT | - | Teléfono |
| website | TEXT | - | Sitio web |
| rating | REAL | - | Calificación (0-5) |
| city | TEXT | - | Ciudad de búsqueda |
| status | TEXT | `'new'` | CHECK: `new`/`pending`/`contacted`/`interested`/`closed` |
| priority | TEXT | `'medium'` | CHECK: `low`/`medium`/`high` |
| notes | TEXT | `''` | Notas internas |
| contact_made | BOOLEAN | `FALSE` | Contacto realizado |
| last_contact | TIMESTAMPTZ | - | Último contacto |
| created_at | TIMESTAMPTZ | `NOW()` | Creación |
| updated_at | TIMESTAMPTZ | `NOW()` | Actualización (auto via trigger) |

### Tabla: `search_history`

| Columna | Tipo | Default | Notas |
|---|---|---|---|
| id | UUID | `gen_random_uuid()` | PRIMARY KEY |
| user_id | UUID | - | FK -> `auth.users(id)` ON DELETE CASCADE |
| city | TEXT | - | NOT NULL - ciudad buscada |
| type | TEXT | - | NOT NULL - tipo de negocio |
| results_count | INTEGER | 0 | Cantidad de resultados |
| created_at | TIMESTAMPTZ | `NOW()` | Fecha de búsqueda |

## Seguridad (RLS)

Row Level Security habilitado en ambas tablas:

```sql
-- Cada usuario SOLO ve/gestiona sus propios registros
CREATE POLICY "Users can manage their own prospects"
  ON prospects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own search history"
  ON search_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Trigger

```sql
-- Actualiza updated_at automáticamente al modificar un prospecto
CREATE TRIGGER prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## Uso desde la App

El store Pinia (`store/app.js`) maneja todas las operaciones CRUD directamente contra Supabase:

- **fetchProspects** - `SELECT * WHERE user_id = auth.uid()`
- **addProspect** - `INSERT` con verificación de place_id duplicado
- **updateProspect** - `UPDATE` por id
- **removeProspect** - `DELETE` por id
- **saveSearch** - `INSERT` en search_history

## Notas

- `useSupabaseDb.js` en `composables/` duplica esta lógica pero NO se usa en la app actual. Ignorarlo y usar el store.
- Las credenciales de Supabase van en `.env`: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- El cliente se inicializa en `src/lib/supabase.js`
