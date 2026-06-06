<template>
  <div class="relevamiento-view">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Relevamiento Comercial</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ crm.stats.total }} negocios relevados
        </p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="crm.showKanban = !crm.showKanban" class="btn-secondary">
          <KanbanSquare class="w-4 h-4" />
          <span class="hidden sm:inline">{{ crm.showKanban ? 'Vista tarjetas' : 'Pipeline' }}</span>
        </button>
        <button @click="exportToCsv" class="btn-secondary">
          <FileDown class="w-4 h-4" />
          <span class="hidden sm:inline">Exportar CSV</span>
        </button>
        <router-link to="/buscar" class="btn-primary">
          <Search class="w-4 h-4" />
          <span class="hidden sm:inline">Buscar negocios</span>
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
      <div class="summary-card">
        <div class="summary-icon bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Building2 class="w-5 h-5" />
        </div>
        <p class="summary-value">{{ crm.stats.total }}</p>
        <p class="summary-label">Total negocios</p>
      </div>
      <div class="summary-card">
        <div class="summary-icon bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400">
          <Clock class="w-5 h-5" />
        </div>
        <p class="summary-value">{{ crm.stats.sinContactar }}</p>
        <p class="summary-label">Sin contactar</p>
      </div>
      <div class="summary-card">
        <div class="summary-icon bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <PhoneCall class="w-5 h-5" />
        </div>
        <p class="summary-value">{{ crm.stats.contactados }}</p>
        <p class="summary-label">Contactados</p>
      </div>
      <div class="summary-card">
        <div class="summary-icon bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <ThumbsUp class="w-5 h-5" />
        </div>
        <p class="summary-value">{{ crm.stats.interesados }}</p>
        <p class="summary-label">Interesados</p>
      </div>
      <div class="summary-card">
        <div class="summary-icon bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <CalendarCheck class="w-5 h-5" />
        </div>
        <p class="summary-value">{{ crm.stats.demos }}</p>
        <p class="summary-label">Demos agendadas</p>
      </div>
      <div class="summary-card">
        <div class="summary-icon bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Award class="w-5 h-5" />
        </div>
        <p class="summary-value">{{ crm.stats.clientes }}</p>
        <p class="summary-label">Clientes</p>
      </div>
      <div class="summary-card">
        <div class="summary-icon bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <DollarSign class="w-5 h-5" />
        </div>
        <p class="summary-value">{{ formatPrice(crm.stats.potencialMensual) }}</p>
        <p class="summary-label">Potencial mensual</p>
      </div>
      <div class="summary-card">
        <div class="summary-icon bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400">
          <TrendingUp class="w-5 h-5" />
        </div>
        <p class="summary-value">{{ formatPrice(crm.stats.comisionEstimada) }}</p>
        <p class="summary-label">Comisión estimada</p>
      </div>
    </div>

    <div class="filters-bar">
      <div class="search-wrapper">
        <Search class="search-icon" />
        <input
          v-model="crm.searchQuery"
          type="text"
          placeholder="Buscar por nombre, dirección, teléfono..."
          class="filter-input"
        />
      </div>
      <select v-model="crm.rubroFilter" class="filter-select">
        <option value="">Todos los rubros</option>
        <option v-for="r in crm.uniqueRubros" :key="r" :value="r">{{ r }}</option>
      </select>
      <select v-model="crm.provinciaFilter" class="filter-select">
        <option value="">Todas las provincias</option>
        <option v-for="p in crm.uniqueProvincias" :key="p" :value="p">{{ p }}</option>
      </select>
      <select v-model="crm.ciudadFilter" class="filter-select">
        <option value="">Todas las ciudades</option>
        <option v-for="c in crm.uniqueCiudades" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="crm.estadoComercialFilter" class="filter-select">
        <option value="">Todos los estados</option>
        <option v-for="e in estadoComercialOptions" :key="e.value" :value="e.value">{{ e.label }}</option>
      </select>
      <select v-model="crm.oportunidadFilter" class="filter-select">
        <option value="">Toda oportunidad</option>
        <option value="alta">🔥 Alta</option>
        <option value="media">🟡 Media</option>
        <option value="baja">🟢 Baja</option>
      </select>
    </div>

    <template v-if="!crm.showKanban">
      <div v-if="crm.filteredProspects.length === 0" class="empty-state">
        <Building2 class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">No hay negocios relevados</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {{ crm.searchQuery ? 'Intenta con otros términos de búsqueda' : 'Busca negocios en Google Maps y agrégalos al relevamiento' }}
        </p>
        <router-link to="/buscar" class="empty-action">
          <Search class="w-4 h-4" />
          Ir a buscar negocios
        </router-link>
      </div>

      <div v-else>
        <div v-for="provGroup in crm.prospectsByProvincia" :key="provGroup.provincia" class="mb-6">
          <div
            @click="toggleProvincia(provGroup.provincia)"
            class="provincia-header"
            :class="{ active: isProvExpanded(provGroup.provincia) }"
          >
            <div class="provincia-header-left">
              <MapPin class="provincia-icon" />
              <h3 class="provincia-name">{{ provGroup.provincia }}</h3>
              <span class="provincia-count">
                {{ provGroup.ciudades.reduce((s, c) => s + c.prospects.length, 0) }} negocio{{ provGroup.ciudades.reduce((s, c) => s + c.prospects.length, 0) !== 1 ? 's' : '' }}
              </span>
            </div>
            <ChevronDown class="provincia-chevron" :class="{ rotated: isProvExpanded(provGroup.provincia) }" />
          </div>

          <div v-show="isProvExpanded(provGroup.provincia)" class="provincia-content">
            <div v-for="cityGroup in provGroup.ciudades" :key="cityGroup.ciudad" class="mb-4">
              <div
                @click="toggleCiudad(cityGroup.ciudad)"
                class="ciudad-header"
                :class="{ active: isCityExpanded(cityGroup.ciudad) }"
              >
                <div class="ciudad-header-left">
                  <Building2 class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <h4 class="ciudad-name">{{ cityGroup.ciudad }}</h4>
                  <span class="ciudad-count">{{ cityGroup.prospects.length }} negocio{{ cityGroup.prospects.length !== 1 ? 's' : '' }}</span>
                </div>
                <ChevronDown class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200" :class="{ rotated: isCityExpanded(cityGroup.ciudad) }" />
              </div>

              <div v-show="isCityExpanded(cityGroup.ciudad)" class="ciudad-content">
                <TransitionGroup name="list" tag="div" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div
                    v-for="prospect in cityGroup.prospects"
                    :key="prospect.id || prospect.place_id"
                    class="commerce-card"
                  >
                    <div class="card-header">
                      <div class="flex items-start justify-between">
                        <div class="flex items-center gap-3 min-w-0">
                          <div class="commerce-avatar">
                            <Store class="w-5 h-5" />
                          </div>
                          <div class="min-w-0">
                            <h4 class="commerce-name truncate">{{ prospect.name }}</h4>
                            <p class="commerce-address truncate">{{ prospect.address || prospect.city }}</p>
                          </div>
                        </div>
                        <button
                          @click="confirmRemove(prospect)"
                          class="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                          title="Eliminar"
                        >
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div class="card-body">
                      <div class="flex flex-wrap items-center gap-1.5 mb-3">
                        <span class="badge-estado" :class="`estado-${prospect.estadoComercial || 'sin_contactar'}`">
                          {{ estadoComercialLabel(prospect.estadoComercial) }}
                        </span>
                        <span v-if="prospect.rubro" class="badge-rubro">
                          <Tag class="w-3 h-3" />
                          {{ prospect.rubro }}
                        </span>
                        <span class="badge-oportunidad" :class="`op-${calcularOportunidad(prospect)}`">
                          {{ oportunidadLabel(calcularOportunidad(prospect)) }}
                        </span>
                      </div>

                      <div class="commerce-info">
                        <div v-if="prospect.phone" class="info-row">
                          <Phone class="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{{ prospect.phone }}</span>
                        </div>
                        <div v-if="prospect.software_actual" class="info-row">
                          <Monitor class="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{{ prospect.software_actual }}</span>
                        </div>
                        <div v-if="prospect.precio_objetivo" class="info-row">
                          <DollarSign class="w-3.5 h-3.5 flex-shrink-0" />
                          <span>$ {{ formatNumber(prospect.precio_objetivo) }}/mes</span>
                        </div>
                        <div v-if="prospect.control_stock" class="info-row">
                          <CheckCircle class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span>Control de stock</span>
                        </div>
                      </div>

                      <div class="card-actions">
                        <button
                          @click="generateAndOpenWhatsApp(prospect)"
                          class="action-btn action-success"
                          :disabled="!prospect.phone"
                          :title="prospect.phone ? 'Abrir WhatsApp' : 'Sin teléfono'"
                        >
                          <MessageCircle class="w-3.5 h-3.5" />
                          <span class="hidden sm:inline">WhatsApp</span>
                        </button>

                        <button
                          @click="openMessageModal(prospect)"
                          class="action-btn action-ai"
                          title="Generar mensaje"
                        >
                          <Sparkles class="w-3.5 h-3.5" />
                          <span class="hidden sm:inline">Generar mensaje</span>
                        </button>

                        <button
                          @click="openDetail(prospect)"
                          class="action-btn action-primary"
                          title="Ver detalle"
                        >
                          <Eye class="w-3.5 h-3.5" />
                          <span class="hidden sm:inline">Detalle</span>
                        </button>

                        <div class="relative">
                          <button
                            @click="toggleStatusMenu($event, prospect.id)"
                            class="status-btn"
                          >
                            <span>{{ estadoComercialLabel(prospect.estadoComercial) }}</span>
                            <ChevronDown class="w-3.5 h-3.5" />
                          </button>
                          <Teleport to="body">
                            <div
                              v-if="openMenuId === prospect.id"
                              class="status-dropdown"
                              :style="menuStyle"
                            >
                              <button
                                v-for="e in estadoComercialOptions"
                                :key="e.value"
                                @click="selectEstado(prospect.id, e.value)"
                                class="status-option"
                                :class="{ selected: prospect.estadoComercial === e.value }"
                              >
                                <span class="status-dot" :class="`dot-${e.color}`"></span>
                                <span>{{ e.label }}</span>
                              </button>
                            </div>
                          </Teleport>
                        </div>
                      </div>
                    </div>
                  </div>
                </TransitionGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="kanban-board">
        <div
          v-for="(col, colKey) in crm.kanbanColumns"
          :key="colKey"
          class="kanban-column"
        >
          <div class="kanban-column-header" :class="`kanban-header-${col.color}`">
            <h3 class="kanban-column-title">{{ col.label }}</h3>
            <span class="kanban-column-count">{{ col.items.length }}</span>
          </div>
          <div class="kanban-column-body scrollbar-thin">
            <div
              v-for="item in col.items"
              :key="item.id || item.place_id"
              class="kanban-card"
              draggable="true"
              @dragstart="onDragStart($event, item)"
              @dragover.prevent
              @drop.prevent="onDrop($event, colKey, item)"
            >
              <div class="kanban-card-header">
                <span class="kanban-card-name">{{ item.name }}</span>
              </div>
              <div class="kanban-card-body">
                <span v-if="item.rubro" class="badge-rubro kanban-badge">
                  {{ item.rubro }}
                </span>
                <span v-if="item.phone" class="kanban-card-info">
                  <Phone class="w-3 h-3" /> {{ item.phone }}
                </span>
              </div>
            </div>
            <div v-if="col.items.length === 0" class="kanban-empty">
              <p>Sin tarjetas</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <Teleport to="body">
      <div v-if="showMessageModal" class="modal-overlay" @click.self="closeMessageModal">
        <div class="modal-content max-w-2xl">
          <div class="modal-header">
            <div class="flex items-center gap-2">
              <Sparkles class="w-5 h-5 text-blue-500" />
              <h3 class="modal-title">Mensaje personalizado</h3>
            </div>
            <button @click="closeMessageModal" class="modal-close">
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="modal-body max-h-[70vh] overflow-y-auto scrollbar-thin space-y-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Tono:</span>
              <div class="flex gap-1.5">
                <button
                  v-for="t in tones"
                  :key="t.key"
                  @click="messageTone = t.key"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                  :class="messageTone === t.key
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-50 dark:bg-[#1a1f2e] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-gray-100 dark:hover:bg-[#222738]'"
                >
                  {{ t.label }}
                </button>
              </div>
            </div>

            <button
              @click="generateMessage"
              :disabled="messageGenerating"
              class="w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
              :class="messageGenerating
                ? 'bg-blue-400 dark:bg-blue-600/50 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25 dark:hover:shadow-blue-500/10 active:scale-[0.98]'"
            >
              <Loader2 v-if="messageGenerating" class="w-4 h-4 animate-spin" />
              <Sparkles v-else class="w-4 h-4" />
              {{ messageGenerating ? 'Generando mensaje...' : (messageResult ? 'Regenerar mensaje' : 'Generar mensaje IA') }}
            </button>

            <div v-if="messageGenerating" class="space-y-3">
              <div v-for="i in 4" :key="i" class="rounded-xl border border-gray-100 dark:border-white/5 p-4">
                <div class="skeleton h-4 w-28 rounded mb-3"></div>
                <div class="skeleton h-3 w-full rounded mb-2"></div>
                <div class="skeleton h-3 w-3/4 rounded mb-2"></div>
                <div class="skeleton h-3 w-1/2 rounded"></div>
              </div>
            </div>

            <div v-else-if="messageError" class="text-center py-8">
              <div class="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-3">
                <AlertCircle class="w-6 h-6 text-red-400" />
              </div>
              <p class="text-sm font-medium text-red-600 dark:text-red-400">{{ messageError }}</p>
            </div>

            <div v-else-if="messageResult" class="space-y-3">
              <div
                v-for="msg in messageList"
                :key="msg.key"
                class="rounded-xl border border-gray-100 dark:border-white/5 overflow-hidden"
              >
                <div class="px-4 py-2.5 bg-gray-50 dark:bg-white/5 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
                  <div class="flex items-center gap-2">
                    <component :is="msg.icon" class="w-4 h-4" :class="msg.color" />
                    <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ msg.label }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button
                      @click="copyMessageText(msg.key)"
                      class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                      title="Copiar"
                    >
                      <Check v-if="messageCopiedKey === msg.key" class="w-4 h-4 text-emerald-500" />
                      <Copy v-else class="w-4 h-4" />
                    </button>
                    <button
                      v-if="msg.action"
                      @click="msg.action()"
                      class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                      :title="msg.actionLabel"
                    >
                      <component :is="msg.actionIcon" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div class="px-4 py-3">
                  <p v-if="msg.key === 'email_formal'" class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    <span class="font-semibold text-blue-600 dark:text-blue-400">{{ messageEmailSubject }}</span><br><br>{{ messageEmailBody }}
                  </p>
                  <p v-else class="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {{ messageResult.messages[msg.key] }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showDetailModal" class="modal-overlay" @click.self="showDetailModal = false">
        <div class="modal-content modal-xl">
          <div class="modal-header">
            <h3 class="modal-title">Detalle de relevamiento comercial</h3>
            <button @click="showDetailModal = false" class="modal-close">
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="modal-body max-h-[70vh] overflow-y-auto scrollbar-thin">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div class="field-group">
                <label class="field-label">Nombre del negocio</label>
                <input v-model="editForm.name" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Rubro</label>
                <select v-model="editForm.rubro" class="field-input">
                  <option value="">Seleccionar rubro...</option>
                  <option v-for="r in rubros" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Provincia</label>
                <select v-model="editForm.provincia" class="field-input">
                  <option value="">Seleccionar...</option>
                  <option v-for="p in crm.uniqueProvincias" :key="p" :value="p">{{ p }}</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Ciudad / Localidad</label>
                <input v-model="editForm.city" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Dirección</label>
                <input v-model="editForm.address" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Teléfono</label>
                <input v-model="editForm.phone" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">WhatsApp</label>
                <input v-model="editForm.whatsapp" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Email</label>
                <input v-model="editForm.email" type="email" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Sitio web</label>
                <input v-model="editForm.website" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Instagram</label>
                <input v-model="editForm.instagram" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Google Maps URL</label>
                <input v-model="editForm.googleMapsUrl" class="field-input" />
              </div>

              <div class="md:col-span-2">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 mt-2">Datos comerciales</h4>
              </div>

              <div class="field-group">
                <label class="field-label">Software actual</label>
                <input v-model="editForm.software_actual" class="field-input" placeholder="Ej: Excel, Sistema X, etc" />
              </div>
              <div class="field-group">
                <label class="field-label">Proveedor actual</label>
                <input v-model="editForm.proveedor_actual" class="field-input" placeholder="Nombre del proveedor" />
              </div>
              <div class="field-group">
                <label class="field-label">Precio actual del sistema ($)</label>
                <input v-model.number="editForm.precio_actual_sistema" type="number" min="0" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Precio objetivo ($)</label>
                <input v-model.number="editForm.precio_objetivo" type="number" min="0" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Ventas estimadas por mes ($)</label>
                <input v-model.number="editForm.ventas_estimadas_mes" type="number" min="0" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Cantidad de cajas</label>
                <input v-model.number="editForm.cantidad_cajas" type="number" min="0" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Cantidad de empleados</label>
                <input v-model.number="editForm.cantidad_empleados" type="number" min="0" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Interés en cambio</label>
                <input v-model="editForm.interes_cambio" class="field-input" placeholder="Si, No, Tal vez..." />
              </div>

              <div class="field-group">
                <label class="field-checkbox">
                  <input v-model="editForm.factura_electronica" type="checkbox" />
                  <span>Factura electrónica</span>
                </label>
              </div>
              <div class="field-group">
                <label class="field-checkbox">
                  <input v-model="editForm.control_stock" type="checkbox" />
                  <span>Control de stock</span>
                </label>
              </div>
              <div class="field-group">
                <label class="field-checkbox">
                  <input v-model="editForm.usa_lector_codigo" type="checkbox" />
                  <span>Usa lector de código</span>
                </label>
              </div>
              <div class="field-group">
                <label class="field-checkbox">
                  <input v-model="editForm.usa_balanza" type="checkbox" />
                  <span>Usa balanza</span>
                </label>
              </div>

              <div class="md:col-span-2">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 mt-2">Seguimiento</h4>
              </div>

              <div class="field-group">
                <label class="field-label">Estado comercial</label>
                <select v-model="editForm.estadoComercial" class="field-input">
                  <option v-for="e in estadoComercialOptions" :key="e.value" :value="e.value">{{ e.label }}</option>
                </select>
              </div>
              <div class="field-group">
                <label class="field-label">Fecha de visita</label>
                <input :value="formatDateInput(editForm.fecha_visita)" @input="e => editForm.fecha_visita = e.target.value || null" type="date" class="field-input" />
              </div>
              <div class="field-group">
                <label class="field-label">Próximo contacto</label>
                <input :value="formatDateInput(editForm.fecha_proximo_contacto)" @input="e => editForm.fecha_proximo_contacto = e.target.value || null" type="date" class="field-input" />
              </div>

              <div class="field-group md:col-span-2">
                <label class="field-label">Problemas detectados</label>
                <textarea v-model="editForm.problemasDetectados" class="field-input field-textarea" rows="2"></textarea>
              </div>
              <div class="field-group md:col-span-2">
                <label class="field-label">Observaciones</label>
                <textarea v-model="editForm.observaciones" class="field-input field-textarea" rows="2"></textarea>
              </div>
              <div class="field-group md:col-span-2">
                <label class="field-label">Notas</label>
                <textarea v-model="editForm.notas" class="field-input field-textarea" rows="2"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer flex gap-2">
            <button @click="showDetailModal = false" class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
              Cancelar
            </button>
            <button @click="saveDetail" class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useCommercialSurvey, rubros, estadoComercialOptions, estadoComercialLabel, calculateOportunidad } from '@/composables/useCommercialSurvey'
import { useWhatsApp } from '@/composables/useWhatsApp'
import { generateCommercialMessages } from '@/services/ai'
import {
  Search, Building2, PhoneCall, ThumbsUp, DollarSign, Monitor,
  Clock, FileDown, MapPin, ChevronDown, Store, Phone, Trash2,
  MessageCircle, Eye, X, KanbanSquare, Tag, CheckCircle,
  Award, CalendarCheck, TrendingUp, Sparkles, Copy, Check,
  AlertCircle, Loader2, Mail, MessageSquare, Send,
} from '@lucide/vue'

const crm = reactive(useCommercialSurvey())
const { buildCommercialWhatsAppMessage, getPhone, normalizePhone, copyWhatsAppMessage } = useWhatsApp()

const showDetailModal = ref(false)
const editingProspect = ref(null)
const editForm = reactive({})
const openMenuId = ref(null)
const menuStyle = ref({})
const provinciaExpanded = reactive({})
const ciudadExpanded = reactive({})
const draggedItem = ref(null)

const showMessageModal = ref(false)
const messageProspect = ref(null)
const messageTone = ref('casual')
const messageGenerating = ref(false)
const messageResult = ref(null)
const messageError = ref('')
const messageCopiedKey = ref('')

const tones = [
  { key: 'casual', label: 'Casual' },
  { key: 'professional', label: 'Profesional' },
  { key: 'seller', label: 'Vendedor' },
  { key: 'technical', label: 'Técnico' },
]

const messageEmailSubject = computed(() => {
  if (!messageResult.value) return ''
  const email = messageResult.value.messages.email_formal || ''
  const parts = email.split('|')
  return parts.length > 1 ? parts[0].trim() : ''
})

const messageEmailBody = computed(() => {
  if (!messageResult.value) return ''
  const email = messageResult.value.messages.email_formal || ''
  const parts = email.split('|')
  return parts.length > 1 ? parts.slice(1).join('|').trim() : email
})

const messageList = computed(() => {
  if (!messageResult.value) return []
  return [
    {
      key: 'whatsapp_corto',
      label: 'WhatsApp Corto',
      icon: MessageCircle,
      color: 'text-emerald-500',
      action: () => sendWpMessage(messageResult.value.messages.whatsapp_corto),
      actionLabel: 'Abrir WhatsApp',
      actionIcon: Send,
    },
    {
      key: 'whatsapp_profesional',
      label: 'WhatsApp Profesional',
      icon: MessageCircle,
      color: 'text-emerald-600',
      action: () => sendWpMessage(messageResult.value.messages.whatsapp_profesional),
      actionLabel: 'Abrir WhatsApp',
      actionIcon: Send,
    },
    {
      key: 'email_formal',
      label: 'Email Formal',
      icon: Mail,
      color: 'text-blue-500',
    },
    {
      key: 'instagram_dm',
      label: 'Instagram DM',
      icon: MessageSquare,
      color: 'text-pink-500',
    },
  ]
})

function onBodyClick(e) {
  if (openMenuId.value !== null) {
    const btn = e.target.closest('.status-btn')
    if (!btn) openMenuId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', onBodyClick)
  crm.initFetch()
})

onUnmounted(() => document.removeEventListener('click', onBodyClick))

function calcularOportunidad(prospect) {
  return calculateOportunidad(prospect)
}

function oportunidadLabel(value) {
  const labels = { alta: '🔥 Alta', media: '🟡 Media', baja: '🟢 Baja' }
  return labels[value] || '🟡 Media'
}

function formatNumber(n) {
  if (n == null) return '-'
  return Number(n).toLocaleString('es-AR')
}

function formatPrice(n) {
  if (!n || n === 0) return '-'
  return '$ ' + Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })
}

function formatDateInput(val) {
  if (!val) return ''
  const d = new Date(val)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function toggleProvincia(prov) {
  provinciaExpanded[prov] = !provinciaExpanded[prov]
}

function isProvExpanded(prov) {
  return provinciaExpanded[prov] ?? true
}

function toggleCiudad(city) {
  ciudadExpanded[city] = !ciudadExpanded[city]
}

function isCityExpanded(city) {
  return ciudadExpanded[city] ?? true
}

function initExpansions() {
  for (const group of crm.prospectsByProvincia) {
    if (!(group.provincia in provinciaExpanded)) {
      provinciaExpanded[group.provincia] = true
    }
    for (const cityGroup of group.ciudades) {
      if (!(cityGroup.ciudad in ciudadExpanded)) {
        ciudadExpanded[cityGroup.ciudad] = true
      }
    }
  }
}

function toggleStatusMenu(e, id) {
  if (openMenuId.value === id) {
    openMenuId.value = null
    return
  }
  const rect = e.currentTarget.getBoundingClientRect()
  menuStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${Math.max(rect.width, 150)}px`,
  }
  openMenuId.value = id
}

function selectEstado(id, estado) {
  crm.setEstado(id, estado)
  openMenuId.value = null
}

function openDetail(prospect) {
  editingProspect.value = prospect
  Object.keys(editForm).forEach(k => delete editForm[k])
  Object.assign(editForm, {
    name: prospect.name || '',
    rubro: prospect.rubro || '',
    provincia: prospect.provincia || '',
    city: prospect.city || '',
    address: prospect.address || '',
    phone: prospect.phone || '',
    whatsapp: prospect.whatsapp || '',
    email: prospect.email || '',
    website: prospect.website || '',
    instagram: prospect.instagram || '',
    googleMapsUrl: prospect.googleMapsUrl || '',
    software_actual: prospect.software_actual || '',
    proveedor_actual: prospect.proveedor_actual || '',
    precio_actual_sistema: prospect.precio_actual_sistema || null,
    precio_objetivo: prospect.precio_objetivo || null,
    ventas_estimadas_mes: prospect.ventas_estimadas_mes || null,
    cantidad_cajas: prospect.cantidad_cajas || 0,
    cantidad_empleados: prospect.cantidad_empleados || 0,
    interes_cambio: prospect.interes_cambio || '',
    factura_electronica: prospect.factura_electronica || false,
    control_stock: prospect.control_stock || false,
    usa_lector_codigo: prospect.usa_lector_codigo || false,
    usa_balanza: prospect.usa_balanza || false,
    estadoComercial: prospect.estadoComercial || 'sin_contactar',
    fecha_visita: prospect.fecha_visita || null,
    fecha_proximo_contacto: prospect.fecha_proximo_contacto || null,
    problemasDetectados: prospect.problemasDetectados || '',
    observaciones: prospect.observaciones || '',
    notas: prospect.notas || '',
  })
  showDetailModal.value = true
}

function saveDetail() {
  if (!editingProspect.value) return
  crm.updateProspect(editingProspect.value.id, { ...editForm })
  showDetailModal.value = false
}

function confirmRemove(prospect) {
  if (confirm(`¿Eliminar "${prospect.name}" del relevamiento?`)) {
    crm.removeProspect(prospect.id)
  }
}

function exportToCsv() {
  const data = crm.filteredProspects.value
  if (data.length === 0) return

  const headers = [
    'Nombre', 'Rubro', 'Provincia', 'Ciudad', 'Dirección', 'Teléfono', 'WhatsApp',
    'Email', 'Sitio web', 'Instagram', 'Google Maps URL',
    'Software actual', 'Proveedor actual', 'Factura electrónica', 'Control stock',
    'Usa lector código', 'Usa balanza', 'Cant. cajas', 'Cant. empleados',
    'Ventas estimadas mes', 'Precio actual sistema', 'Precio objetivo',
    'Interés cambio', 'Fecha visita', 'Próximo contacto',
    'Estado comercial', 'Oportunidad', 'Problemas detectados', 'Observaciones', 'Notas',
  ]

  const rows = data.map(p => [
    escapeCsv(p.name),
    escapeCsv(p.rubro),
    escapeCsv(p.provincia),
    escapeCsv(p.city),
    escapeCsv(p.address),
    escapeCsv(p.phone),
    escapeCsv(p.whatsapp),
    escapeCsv(p.email),
    escapeCsv(p.website),
    escapeCsv(p.instagram),
    escapeCsv(p.googleMapsUrl),
    escapeCsv(p.software_actual),
    escapeCsv(p.proveedor_actual),
    p.factura_electronica ? 'Sí' : 'No',
    p.control_stock ? 'Sí' : 'No',
    p.usa_lector_codigo ? 'Sí' : 'No',
    p.usa_balanza ? 'Sí' : 'No',
    p.cantidad_cajas || '0',
    p.cantidad_empleados || '0',
    p.ventas_estimadas_mes || '',
    p.precio_actual_sistema || '',
    p.precio_objetivo || '',
    escapeCsv(p.interes_cambio),
    p.fecha_visita || '',
    p.fecha_proximo_contacto || '',
    estadoComercialLabel(p.estadoComercial),
    oportunidadLabel(calcularOportunidad(p)),
    escapeCsv(p.problemasDetectados),
    escapeCsv(p.observaciones),
    escapeCsv(p.notas),
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const bom = '\uFEFF'
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `relevamiento-comercial-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function escapeCsv(val) {
  if (!val) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function onDragStart(e, item) {
  draggedItem.value = item
  e.dataTransfer.effectAllowed = 'move'
}

function onDrop(e, targetColumn, targetItem) {
  if (!draggedItem.value) return
  crm.setEstado(draggedItem.value.id, targetColumn)
  draggedItem.value = null
}

function openMessageModal(prospect) {
  messageProspect.value = prospect
  messageTone.value = 'casual'
  messageResult.value = null
  messageError.value = ''
  messageGenerating.value = false
  messageCopiedKey.value = ''
  showMessageModal.value = true
}

function closeMessageModal() {
  showMessageModal.value = false
  messageResult.value = null
}

async function generateMessage() {
  if (!messageProspect.value) return
  messageGenerating.value = true
  messageError.value = ''
  messageResult.value = null

  try {
    messageResult.value = await generateCommercialMessages(messageProspect.value, messageTone.value)
  } catch (e) {
    messageError.value = e.message || 'Error al generar mensajes'
  } finally {
    messageGenerating.value = false
  }
}

async function copyMessageText(key) {
  const text = messageResult.value?.messages?.[key]
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    messageCopiedKey.value = key
    setTimeout(() => { messageCopiedKey.value = '' }, 2000)
  } catch { /* ignore */ }
}

function sendWpMessage(message) {
  if (!message || !messageProspect.value) return
  const phone = getPhone(messageProspect.value)
  if (!phone) return
  const normalized = normalizePhone(phone)
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}

function generateAndOpenWhatsApp(prospect) {
  const phone = getPhone(prospect)
  if (!phone) {
    alert('Este prospecto no tiene número de teléfono disponible.')
    return
  }
  const message = buildCommercialWhatsAppMessage(prospect)
  const normalized = normalizePhone(phone)
  const url = `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
  copyWhatsAppMessage(prospect)
  window.open(url, '_blank')
}

watch(() => crm.prospectsByProvincia.length, (len) => {
  if (len > 0) initExpansions()
})
</script>

<style scoped>
.btn-secondary {
  @apply inline-flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-medium;
  @apply bg-white dark:bg-[#111827];
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-600 dark:text-gray-400;
  @apply hover:bg-gray-50 dark:hover:bg-white/5;
  @apply transition-all duration-200;
  @apply no-underline;
}

.btn-primary {
  @apply inline-flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-medium;
  @apply bg-blue-500 text-white;
  @apply hover:bg-blue-600;
  @apply transition-all duration-200;
  @apply shadow-lg shadow-blue-500/25;
  @apply no-underline;
}

.summary-card {
  @apply bg-white dark:bg-[#111827] rounded-2xl p-4;
  @apply border border-gray-100 dark:border-white/5 shadow-soft;
  @apply animate-fade-in;
}

.summary-icon {
  @apply w-9 h-9 rounded-xl flex items-center justify-center mb-2;
}

.summary-value {
  @apply text-xl font-bold text-gray-900 dark:text-white;
}

.summary-label {
  @apply text-[11px] text-gray-500 dark:text-gray-400 mt-0.5;
}

.filters-bar {
  @apply flex flex-wrap items-center gap-2 mb-6;
}

.search-wrapper {
  @apply relative flex-1 min-w-[200px];
}

.search-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none;
}

.filter-input {
  @apply w-full h-10 pl-10 pr-4 rounded-xl text-sm;
  @apply bg-white dark:bg-[#111827];
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-900 dark:text-white placeholder:text-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
  @apply transition-all duration-200;
}

.filter-select {
  @apply h-10 px-3 rounded-xl text-sm;
  @apply bg-white dark:bg-[#111827];
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-900 dark:text-white;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
  @apply transition-all duration-200;
  min-width: 120px;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-20 text-center;
}

.empty-action {
  @apply inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium;
  @apply bg-blue-500 text-white hover:bg-blue-600;
  @apply transition-all duration-200 no-underline;
  @apply shadow-lg shadow-blue-500/25;
}

.commerce-card {
  @apply bg-white dark:bg-[#111827] rounded-2xl;
  @apply border border-gray-100 dark:border-white/5 shadow-soft;
  @apply transition-all duration-200;
  @apply animate-scale-in;
  @apply overflow-hidden;
}

.card-header {
  @apply p-4 border-b border-gray-100 dark:border-white/5;
}

.commerce-avatar {
  @apply w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600;
  @apply flex items-center justify-center text-white flex-shrink-0;
}

.commerce-name {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.commerce-address {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.card-body {
  @apply p-4;
}

.badge-estado {
  @apply inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium;
}

.estado-sin_contactar { @apply bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400; }
.estado-contactado { @apply bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400; }
.estado-interesado { @apply bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400; }
.estado-demo_agendada { @apply bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400; }
.estado-propuesta_enviada { @apply bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400; }
.estado-cliente { @apply bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400; }
.estado-no_interesado { @apply bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400; }

.badge-rubro {
  @apply inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium;
  @apply bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400;
}

.badge-oportunidad {
  @apply inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium;
}

.op-alta { @apply bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400; }
.op-media { @apply bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400; }
.op-baja { @apply bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400; }

.commerce-info {
  @apply space-y-1.5;
}

.info-row {
  @apply flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400;
}

.card-actions {
  @apply mt-3 pt-3 border-t border-gray-100 dark:border-white/5;
  @apply flex items-center gap-2;
}

.action-btn {
  @apply inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium;
  @apply transition-all duration-200;
}

.action-btn:disabled {
  @apply opacity-40 cursor-not-allowed;
}

.action-success {
  @apply bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400;
  @apply hover:bg-emerald-100 dark:hover:bg-emerald-900/30;
}

.action-primary {
  @apply bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400;
  @apply hover:bg-blue-100 dark:hover:bg-blue-900/30;
}

.action-ai {
  @apply bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400;
  @apply hover:bg-violet-100 dark:hover:bg-violet-900/30;
}

.status-btn {
  @apply flex items-center gap-1.5 pl-2 pr-1.5 py-1.5 rounded-lg text-xs font-medium;
  @apply bg-gray-100 dark:bg-white/10;
  @apply border border-gray-300 dark:border-white/20;
  @apply text-gray-800 dark:text-gray-200;
  @apply hover:bg-gray-200 dark:hover:bg-white/20;
  @apply transition-colors cursor-pointer whitespace-nowrap;
  min-width: 90px;
}

.status-btn svg {
  @apply text-gray-400 dark:text-gray-500 shrink-0;
}

.status-dropdown {
  @apply z-50;
  @apply bg-white dark:bg-[#1e293b];
  @apply border border-gray-200 dark:border-white/15;
  @apply rounded-xl shadow-xl;
  @apply py-1.5;
  @apply animate-fade-in;
}

.status-option {
  @apply flex items-center gap-2 w-full px-3 py-2 text-xs text-left;
  @apply text-gray-700 dark:text-gray-200;
  @apply hover:bg-gray-100 dark:hover:bg-white/10;
  @apply transition-colors cursor-pointer;
}

.status-option.selected {
  @apply font-semibold;
  @apply bg-blue-50 dark:bg-blue-900/20;
  @apply text-blue-700 dark:text-blue-300;
}

.status-dot {
  @apply w-2 h-2 rounded-full shrink-0;
}

.dot-blue      { @apply bg-blue-500; }
.dot-emerald   { @apply bg-emerald-500; }
.dot-orange    { @apply bg-orange-500; }
.dot-violet    { @apply bg-violet-500; }
.dot-indigo    { @apply bg-indigo-500; }
.dot-amber     { @apply bg-amber-500; }
.dot-slate     { @apply bg-gray-400; }

.modal-overlay {
  @apply fixed inset-0 z-[100] flex items-center justify-center p-4;
  @apply bg-black/40 backdrop-blur-sm;
}

.modal-content {
  @apply bg-white dark:bg-[#111827];
  @apply rounded-2xl shadow-2xl;
  @apply border border-gray-200 dark:border-white/10;
  @apply w-full max-w-lg mx-4;
  @apply animate-scale-in;
}

.modal-content.modal-xl {
  @apply max-w-3xl;
}

.modal-header {
  @apply flex items-center justify-between px-6 py-4;
  @apply border-b border-gray-100 dark:border-white/5;
}

.modal-title {
  @apply text-base font-semibold text-gray-900 dark:text-white;
}

.modal-close {
  @apply p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200;
  @apply hover:bg-gray-100 dark:hover:bg-white/10;
  @apply transition-colors;
}

.modal-body {
  @apply p-6;
}

.modal-footer {
  @apply px-6 py-4;
  @apply border-t border-gray-100 dark:border-white/5;
}

.field-group {
  @apply space-y-1;
}

.field-label {
  @apply block text-xs font-medium text-gray-500 dark:text-gray-400;
}

.field-input {
  @apply w-full h-10 px-3 rounded-xl text-sm;
  @apply bg-gray-50 dark:bg-white/5;
  @apply border border-gray-200 dark:border-white/10;
  @apply text-gray-900 dark:text-white placeholder:text-gray-400;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500;
  @apply transition-all duration-200;
}

.field-textarea {
  @apply h-auto py-2.5 resize-none;
}

.field-checkbox {
  @apply flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm cursor-pointer;
  @apply bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10;
  @apply transition-all duration-200;
}

.field-checkbox input[type="checkbox"] {
  @apply w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500;
}

.field-checkbox span {
  @apply text-gray-700 dark:text-gray-300;
}

.provincia-header {
  @apply flex items-center justify-between w-full px-5 py-3.5 rounded-xl cursor-pointer select-none;
  @apply bg-gray-50 dark:bg-white/[0.04];
  @apply border border-gray-200 dark:border-white/10;
  @apply transition-all duration-200;
}

.provincia-header:hover {
  @apply bg-gray-100 dark:bg-white/[0.08];
}

.provincia-header.active {
  @apply border-blue-200 dark:border-blue-900/50;
}

.provincia-header-left {
  @apply flex items-center gap-3 min-w-0;
}

.provincia-icon {
  @apply w-4 h-4 text-blue-500 flex-shrink-0;
}

.provincia-name {
  @apply text-base font-bold text-gray-900 dark:text-white;
}

.provincia-count {
  @apply text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap;
}

.provincia-chevron {
  @apply w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0;
}

.provincia-chevron.rotated {
  transform: rotate(180deg);
}

.provincia-content {
  @apply pt-3 pl-4;
}

.ciudad-header {
  @apply flex items-center justify-between w-full px-4 py-2.5 rounded-xl cursor-pointer select-none;
  @apply bg-white dark:bg-[#111827];
  @apply border border-gray-100 dark:border-white/5;
  @apply transition-all duration-200;
}

.ciudad-header:hover {
  @apply bg-gray-50 dark:bg-white/[0.04];
}

.ciudad-header.active {
  @apply border-blue-100 dark:border-blue-900/30;
}

.ciudad-header-left {
  @apply flex items-center gap-2 min-w-0;
}

.ciudad-name {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.ciudad-count {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.ciudad-content {
  @apply pt-3;
}

.list-enter-active,
.list-leave-active {
  @apply transition-all duration-300 ease-in-out;
}

.list-enter-from {
  @apply opacity-0 translate-y-4;
}

.list-leave-to {
  @apply opacity-0 -translate-y-4;
}

.list-move {
  @apply transition-all duration-300;
}

.kanban-board {
  @apply flex gap-4 overflow-x-auto pb-4 scrollbar-thin;
  min-height: 500px;
}

.kanban-column {
  @apply flex-shrink-0 w-72;
  @apply bg-gray-50 dark:bg-white/[0.03];
  @apply rounded-2xl border border-gray-100 dark:border-white/5;
  @apply flex flex-col;
}

.kanban-column-header {
  @apply px-4 py-3 rounded-t-2xl font-semibold text-sm;
  @apply flex items-center justify-between;
  @apply border-b border-gray-100 dark:border-white/5;
}

.kanban-header-slate { @apply bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300; }
.kanban-header-blue { @apply bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300; }
.kanban-header-emerald { @apply bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300; }
.kanban-header-violet { @apply bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300; }
.kanban-header-indigo { @apply bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300; }
.kanban-header-amber { @apply bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300; }

.kanban-column-title {
  @apply text-sm font-semibold;
}

.kanban-column-count {
  @apply inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold;
  @apply bg-white/50 dark:bg-black/20;
}

.kanban-column-body {
  @apply flex-1 p-3 space-y-2 overflow-y-auto;
  max-height: 600px;
}

.kanban-card {
  @apply bg-white dark:bg-[#111827];
  @apply border border-gray-100 dark:border-white/10;
  @apply rounded-xl p-3 cursor-grab;
  @apply shadow-sm hover:shadow-md;
  @apply transition-all duration-200;
}

.kanban-card:hover {
  @apply -translate-y-0.5;
}

.kanban-card-header {
  @apply mb-2;
}

.kanban-card-name {
  @apply text-sm font-semibold text-gray-900 dark:text-white;
}

.kanban-card-body {
  @apply space-y-1.5;
}

.kanban-badge {
  @apply inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium;
}

.kanban-card-info {
  @apply flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400;
}

.kanban-empty {
  @apply flex items-center justify-center py-8;
}

.kanban-empty p {
  @apply text-xs text-gray-400 dark:text-gray-600;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-4px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-fade-in {
  animation: fade-in 0.15s ease-out;
}
</style>
