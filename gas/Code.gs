/**
 * ============================================================================
 * SISTEMA ENTERPRISE DE SEGUIMIENTO DE SOLICITUDES - BACKEND GOOGLE APPS SCRIPT
 * Version: 4.8 Enterprise (Con Función de Prueba Directa testSaveCatalog y Logging)
 * ============================================================================
 */

var DRIVE_FOLDER_ID = "";

function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  try {
    var resource = (e && e.parameter && e.parameter.resource) || 'init';
    var action = (e && e.parameter && e.parameter.action) || (method === 'GET' ? 'read' : 'write');
    
    var bodyData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        bodyData = JSON.parse(e.postData.contents);
      } catch (err) {
        bodyData = {};
      }
    }
    
    var userEmail = (e && e.parameter && e.parameter.userEmail) || bodyData.userEmail || 'admin.director@empresa.com';
    var since = (e && e.parameter && e.parameter.since) || bodyData.since || null;

    Logger.log('📩 Petición recibida: resource=' + resource + ', action=' + action + ', method=' + method);

    switch (resource) {
      case 'init':
        return buildResponse(getInitialData(userEmail));
      
      case 'requests':
        if (method === 'GET') {
          return buildResponse(getRequestDeltas(since));
        } else if (action === 'create') {
          return buildResponse(createRequest(bodyData, userEmail));
        } else if (action === 'update') {
          return buildResponse(updateRequest(bodyData, userEmail));
        } else if (action === 'changeStatus') {
          return buildResponse(changeRequestStatus(bodyData, userEmail));
        } else if (action === 'delete') {
          return buildResponse(deleteRequest(bodyData, userEmail));
        } else if (action === 'migrate') {
          return buildResponse(migrarDesdeHoja1());
        }
        break;

      case 'attachments':
        if (action === 'upload') {
          return buildResponse(uploadFileToDrive(bodyData, userEmail));
        }
        break;

      case 'config':
        if (method === 'GET') {
          return buildResponse(getCatalogs());
        } else if (action === 'save') {
          return buildResponse(saveCatalog(bodyData, userEmail));
        }
        break;

      case 'users':
        if (method === 'GET') {
          return buildResponse(getUsers());
        } else if (action === 'updatePermissions') {
          return buildResponse(updateUserPermissions(bodyData, userEmail));
        }
        break;

      default:
        return buildResponse(getInitialData(userEmail));
    }

    return buildResponse({ error: 'BAD_REQUEST', message: 'Recurso o acción inválida.' }, 400);

  } catch (error) {
    Logger.log('❌ Error en handleRequest: ' + error.toString());
    return buildResponse({ error: 'SERVER_ERROR', message: error.toString() }, 500);
  }
}

function buildResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ==========================================
// FUNCIÓN DE PRUEBA DIRECTA DE CATÁLOGOS
// ==========================================

/**
 * Puedes ejecutar esta función directamente desde Apps Script (Seleccionando testSaveCatalog y dando clic en ▶ Ejecutar)
 * para probar el guardado directo de áreas en la pestaña Cat_Areas de tu Google Spreadsheet.
 */
function testSaveCatalog() {
  var sampleAreas = [
    { id: 'INGER', nombre: 'INGER', responsable: 'Dirección INGER' },
    { id: 'CONASAMA', nombre: 'CONASAMA', responsable: 'Dirección CONASAMA' },
    { id: 'DGRHO', nombre: 'DGRHO', responsable: 'Recursos Humanos' },
    { id: 'UT SHARNY', nombre: 'UT SHARNY', responsable: 'Unidad Transparencia' },
    { id: 'DGRMYNS', nombre: 'DGRMYNS', responsable: 'Materiales y Servicios' },
    { id: 'CNEGSSR', nombre: 'CNEGSSR', responsable: 'CNEGSSR' }
  ];
  var res = saveCatalog({ catalogName: 'Cat_Areas', items: sampleAreas }, 'admin@empresa.com');
  Logger.log('🟢 Resultado de guardado de prueba: ' + JSON.stringify(res));
  return res;
}

// ==========================================
// OPERACIONES DE CATÁLOGOS Y CONFIGURACIÓN
// ==========================================

function getCatalogs() {
  return {
    statusCatalog: getSheetDataAsObjects('Cat_Estatus'),
    dueRulesCatalog: getSheetDataAsObjects('Cat_ReglasVencimiento'),
    areasCatalog: getSheetDataAsObjects('Cat_Areas'),
    typesCatalog: getSheetDataAsObjects('Cat_Tipos'),
    tagsCatalog: getSheetDataAsObjects('Cat_Etiquetas')
  };
}

function saveCatalog(payload, userEmail) {
  var catalogName = payload ? payload.catalogName : null;
  var items = payload ? payload.items : null;
  if (!catalogName || !items || !Array.isArray(items)) {
    Logger.log('⚠️ Payload inválido en saveCatalog');
    return { error: 'INVALID_PAYLOAD', message: 'Catálogo o ítems inválidos.' };
  }

  Logger.log('💾 Guardando catálogo ' + catalogName + ' con ' + items.length + ' elementos...');
  var sheet = getSheet(catalogName);
  sheet.clearContents();

  initializeHeaders(sheet, catalogName);

  items.forEach(function(item) {
    if (catalogName === 'Cat_Areas') {
      sheet.appendRow([item.id || item.Id || generateUUID(), item.nombre || item.Nombre || '', item.responsable || item.Responsable || '']);
    } else if (catalogName === 'Cat_Estatus') {
      sheet.appendRow([item.id || item.Id || generateUUID(), item.nombre || item.Nombre || '', item.colorHex || item.ColorHex || '#3B82F6', item.orden || 1]);
    } else if (catalogName === 'Cat_ReglasVencimiento') {
      sheet.appendRow([
        item.id || item.Id || generateUUID(),
        item.diasUmbral !== undefined ? item.diasUmbral : 0,
        item.prioridadNombre || item.PrioridadNombre || '',
        item.colorHex || item.ColorHex || '#3B82F6',
        item.mensajeAlerta || item.MensajeAlerta || '',
        item.mostrarIcono === true || item.MostrarIcono === true,
        item.sobrescribirColor === true || item.SobrescribirColor === true
      ]);
    } else if (catalogName === 'Cat_Tipos') {
      sheet.appendRow([item.id || generateUUID(), item.nombre || '', item.descripcion || '']);
    } else if (catalogName === 'Cat_Etiquetas') {
      sheet.appendRow([item.id || generateUUID(), item.nombre || '', item.colorHex || '#3B82F6']);
    }
  });

  recordHistory('', userEmail || 'admin', 'Configuracion', 'ModuloSettings', 'MODIFICACION_CATALOGO', '', 'Catálogo ' + catalogName + ' actualizado (' + items.length + ' ítems)');

  Logger.log('✅ Catálogo ' + catalogName + ' guardado con éxito.');
  return { success: true, catalogName: catalogName, count: items.length };
}

function getUsers() {
  return getSheetDataAsObjects('Usuarios');
}

function updateUserPermissions(payload, userEmail) {
  var sheet = getSheet('Usuarios');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === payload.userId || data[i][1].toString().toLowerCase() === (payload.userEmail || '').toLowerCase()) {
      sheet.getRange(i + 1, 5).setValue(payload.permissions || 'ADMIN');
      return { success: true };
    }
  }
  return { error: 'USER_NOT_FOUND', message: 'Usuario no encontrado.' };
}

// ==========================================
// OPERACIONES DE DATOS Y SOLICITUDES
// ==========================================

function getInitialData(userEmail) {
  return {
    requests: getSheetDataAsObjects('Solicitudes'),
    requestTags: getSheetDataAsObjects('SolicitudEtiquetas'),
    history: getSheetDataAsObjects('Historial'),
    attachments: getSheetDataAsObjects('Adjuntos'),
    users: getSheetDataAsObjects('Usuarios'),
    statusCatalog: getSheetDataAsObjects('Cat_Estatus'),
    dueRulesCatalog: getSheetDataAsObjects('Cat_ReglasVencimiento'),
    areasCatalog: getSheetDataAsObjects('Cat_Areas'),
    typesCatalog: getSheetDataAsObjects('Cat_Tipos'),
    tagsCatalog: getSheetDataAsObjects('Cat_Etiquetas'),
    timestamp: new Date().toISOString()
  };
}

function getRequestDeltas(sinceIso) {
  var allRequests = getSheetDataAsObjects('Solicitudes');
  if (!sinceIso) return { requests: allRequests, timestamp: new Date().toISOString() };

  var sinceDate = new Date(sinceIso);
  var deltas = allRequests.filter(function(r) {
    var modDate = new Date(r.UltimaModificacion || r.FechaEntrada);
    return modDate >= sinceDate;
  });

  return {
    requests: deltas,
    requestTags: getSheetDataAsObjects('SolicitudEtiquetas'),
    timestamp: new Date().toISOString()
  };
}

function createRequest(payload, userEmail) {
  var sheet = getSheet('Solicitudes');
  var now = new Date().toISOString();
  var id = payload.id || generateUUID();
  var version = 1;

  var row = [
    id,
    payload.folio || ('FOL-' + Math.floor(1000 + Math.random() * 9000)),
    payload.solicitud,
    payload.areaId,
    payload.tema,
    payload.tipoId,
    payload.ipDp || 'INFORMACION PUBLICA',
    payload.fechaEntrada,
    payload.fechaVencimiento,
    payload.fechaTermino || '',
    payload.estatusId,
    payload.observaciones || '',
    userEmail,
    now,
    version,
    false
  ];

  sheet.appendRow(row);

  if (payload.tags && payload.tags.length > 0) {
    saveRequestTags(id, payload.tags);
  }

  recordHistory(id, userEmail, 'Solicitudes', 'ModalFormulario', 'CREACION', 'Ninguno', 'Solicitud Creada: ' + payload.solicitud);

  return { success: true, id: id, version: version, timestamp: now };
}

function updateRequest(payload, userEmail) {
  var sheet = getSheet('Solicitudes');
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  var currentVersion = 1;

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === payload.id) {
      rowIndex = i + 1;
      currentVersion = Number(data[i][14]) || 1;
      break;
    }
  }

  if (rowIndex === -1) {
    return { error: 'NOT_FOUND', message: 'La solicitud no existe.' };
  }

  var now = new Date().toISOString();
  var newVersion = currentVersion + 1;

  sheet.getRange(rowIndex, 3).setValue(payload.solicitud);
  sheet.getRange(rowIndex, 4).setValue(payload.areaId);
  sheet.getRange(rowIndex, 5).setValue(payload.tema);
  sheet.getRange(rowIndex, 6).setValue(payload.tipoId);
  sheet.getRange(rowIndex, 7).setValue(payload.ipDp || 'INFORMACION PUBLICA');
  sheet.getRange(rowIndex, 8).setValue(payload.fechaEntrada);
  sheet.getRange(rowIndex, 9).setValue(payload.fechaVencimiento);
  sheet.getRange(rowIndex, 10).setValue(payload.fechaTermino || '');
  sheet.getRange(rowIndex, 11).setValue(payload.estatusId);
  sheet.getRange(rowIndex, 12).setValue(payload.observaciones || '');
  sheet.getRange(rowIndex, 14).setValue(now);
  sheet.getRange(rowIndex, 15).setValue(newVersion);

  if (payload.tags) {
    saveRequestTags(payload.id, payload.tags);
  }

  recordHistory(payload.id, userEmail, payload.modulo || 'Solicitudes', payload.origen || 'ModalFormulario', 'EDICION', 'Varios', 'Solicitud Modificada');

  return { success: true, id: payload.id, version: newVersion, timestamp: now };
}

function changeRequestStatus(payload, userEmail) {
  var sheet = getSheet('Solicitudes');
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  var oldStatus = '';
  var currentVersion = 1;

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === payload.id) {
      rowIndex = i + 1;
      oldStatus = data[i][10];
      currentVersion = Number(data[i][14]) || 1;
      break;
    }
  }

  if (rowIndex === -1) return { error: 'NOT_FOUND', message: 'Solicitud no encontrada' };

  var now = new Date().toISOString();
  var newVersion = currentVersion + 1;

  sheet.getRange(rowIndex, 11).setValue(payload.newStatusId);
  sheet.getRange(rowIndex, 14).setValue(now);
  sheet.getRange(rowIndex, 15).setValue(newVersion);

  if (payload.isFinalStatus) {
    sheet.getRange(rowIndex, 10).setValue(now.substring(0, 10));
  }

  recordHistory(payload.id, userEmail, payload.modulo || 'Solicitudes', payload.origen || 'TablaPrincipal', 'CAMBIO_ESTATUS', oldStatus, payload.newStatusId);

  return { success: true, id: payload.id, version: newVersion, timestamp: now };
}

function deleteRequest(payload, userEmail) {
  var sheet = getSheet('Solicitudes');
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === payload.id) {
      sheet.getRange(i + 1, 16).setValue(true);
      recordHistory(payload.id, userEmail, 'Solicitudes', 'TablaPrincipal', 'ELIMINACION', 'Activo', 'Eliminado Lógicamente');
      return { success: true, id: payload.id };
    }
  }
  return { error: 'NOT_FOUND', message: 'Solicitud no encontrada.' };
}

function migrarDesdeHoja1() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var sourceSheet = null;

  var systemSheets = ['solicitudes', 'solicitudetiquetas', 'historial', 'adjuntos', 'usuarios', 'cat_estatus', 'cat_reglasvencimiento', 'cat_areas', 'cat_tipos', 'cat_etiquetas'];

  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName().trim().toLowerCase();
    if (systemSheets.indexOf(name) === -1) {
      sourceSheet = sheets[i];
      break;
    }
  }

  if (!sourceSheet) {
    return { error: 'NO_SOURCE_SHEET', message: 'Crea una pestaña llamada "Hoja1" y pega tus datos del Excel.' };
  }

  var data = sourceSheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { error: 'EMPTY_SHEET', message: 'La pestaña de origen está vacía.' };
  }

  var headerRowIndex = 0;
  var colMap = { solicitud: 0, area: 1, fechaVenc: 4, estatus: 5, tema: 6, observaciones: 7, ipDp: 8, folio: 9, fechaEntrada: 10, fechaTermino: 11 };

  for (var r = 0; r < Math.min(5, data.length); r++) {
    var rowText = data[r].join(' ').toUpperCase();
    if (rowText.indexOf('SOLICITUD') !== -1 || rowText.indexOf('TEMA') !== -1) {
      headerRowIndex = r;
      for (var c = 0; c < data[r].length; c++) {
        var cell = data[r][c].toString().toUpperCase().trim();
        if (cell.indexOf('SOLICITUD') !== -1) colMap.solicitud = c;
        else if (cell.indexOf('AREA') !== -1 || cell.indexOf('ÁREA') !== -1) colMap.area = c;
        else if (cell.indexOf('VENCIMIENTO') !== -1) colMap.fechaVenc = c;
        else if (cell.indexOf('ESTATUS') !== -1) colMap.estatus = c;
        else if (cell.indexOf('TEMA') !== -1) colMap.tema = c;
        else if (cell.indexOf('OBSERVACIO') !== -1) colMap.observaciones = c;
        else if (cell.indexOf('IP') !== -1 || cell.indexOf('DP') !== -1) colMap.ipDp = c;
        else if (cell.indexOf('FOLIO') !== -1) colMap.folio = c;
        else if (cell.indexOf('ENTRADA') !== -1) colMap.fechaEntrada = c;
        else if (cell.indexOf('TERMINO') !== -1 || cell.indexOf('TÉRMINO') !== -1) colMap.fechaTermino = c;
      }
      break;
    }
  }

  var targetSheet = getSheet('Solicitudes');
  var now = new Date().toISOString();
  var count = 0;

  for (var i = headerRowIndex + 1; i < data.length; i++) {
    var row = data[i];
    var solicitud = row[colMap.solicitud];
    if (!solicitud || solicitud.toString().trim() === '') continue;

    var areaId = row[colMap.area] ? row[colMap.area].toString().trim() : 'GENERAL';
    var fechaVenc = parseExcelDate(row[colMap.fechaVenc]);
    var estatusRaw = row[colMap.estatus] ? row[colMap.estatus].toString().trim().toUpperCase() : '';
    var tema = row[colMap.tema] || '';
    var observaciones = row[colMap.observaciones] || '';
    var ipDpRaw = row[colMap.ipDp] ? row[colMap.ipDp].toString().trim().toUpperCase() : '';
    var folio = row[colMap.folio] ? row[colMap.folio].toString().trim() : ('FOL-' + (1000 + i));
    var fechaEntrada = parseExcelDate(row[colMap.fechaEntrada]);
    var fechaTermino = parseExcelDate(row[colMap.fechaTermino]);

    var estatusId = 'EST-ANA';
    if (estatusRaw === 'TERMINADA' || estatusRaw === 'LISTO') estatusId = 'EST-TER';
    else if (estatusRaw === 'ANALIZAR') estatusId = 'EST-ANA';
    else if (estatusRaw.indexOf('RESPUESTA') !== -1) estatusId = 'EST-ESP';
    else if (estatusRaw.indexOf('COMITE') !== -1 || estatusRaw.indexOf('COMITÉ') !== -1) estatusId = 'EST-COM';
    else if (estatusRaw.indexOf('PRORROGA') !== -1 || estatusRaw.indexOf('PRÓRROGA') !== -1) estatusId = 'EST-PRO';
    else if (estatusRaw === 'CANCELADA' || estatusRaw === 'DESECHADA') estatusId = 'EST-CAN';

    var ipDp = 'INFORMACION PUBLICA';
    if (ipDpRaw.indexOf('DATOS') !== -1 || ipDpRaw === 'DP') ipDp = 'DATOS PERSONALES';
    else if (ipDpRaw.indexOf('AMBOS') !== -1 || ipDpRaw.indexOf('/') !== -1) ipDp = 'INFORMACION PUBLICA / DATOS PERSONALES';

    var newRow = [
      generateUUID(),
      folio,
      solicitud,
      areaId,
      tema,
      'TIPO-GEN',
      ipDp,
      fechaEntrada || now.substring(0, 10),
      fechaVenc || now.substring(0, 10),
      fechaTermino || '',
      estatusId,
      observaciones,
      'migracion.excel@empresa.com',
      now,
      1,
      false
    ];

    targetSheet.appendRow(newRow);
    count++;
  }

  return { success: true, count: count, message: 'Se migraron exitosamente ' + count + ' registros.' };
}

function parseExcelDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, "GMT-6", "yyyy-MM-dd");
  }
  var str = val.toString().trim();
  if (str.length >= 10 && str.indexOf('-') === 4) {
    return str.substring(0, 10);
  }
  var parts = str.split('/');
  if (parts.length === 3) {
    var day = parts[0].padStart(2, '0');
    var month = parts[1].padStart(2, '0');
    var year = parts[2];
    if (year.length === 2) year = '20' + year;
    return year + '-' + month + '-' + day;
  }
  return str;
}

function uploadFileToDrive(payload, userEmail) {
  var folder;
  if (DRIVE_FOLDER_ID && DRIVE_FOLDER_ID !== "") {
    folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } else {
    var folders = DriveApp.getFoldersByName("Solicitudes_Adjuntos");
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder("Solicitudes_Adjuntos");
    }
  }

  var contentType = payload.contentType || 'application/pdf';
  var bytes = Utilities.base64Decode(payload.base64Data);
  var blob = Utilities.newBlob(bytes, contentType, payload.fileName);
  
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  var fileUrl = file.getUrl();
  var fileId = file.getId();
  var attId = generateUUID();
  var now = new Date().toISOString();

  var attSheet = getSheet('Adjuntos');
  attSheet.appendRow([
    attId,
    payload.idSolicitud,
    payload.fileName,
    payload.tipoDocumento || 'General',
    payload.fileName.split('.').pop() || 'pdf',
    fileUrl,
    fileId,
    payload.sizeBytes || 0,
    now,
    userEmail
  ]);

  recordHistory(payload.idSolicitud, userEmail, 'Adjuntos', 'ModalDetalle', 'ADJUNTO', '', 'Archivo adjuntado: ' + payload.fileName);

  return {
    success: true,
    attachment: {
      idAdjunto: attId,
      idSolicitud: payload.idSolicitud,
      nombreArchivo: payload.fileName,
      tipoDocumento: payload.tipoDocumento || 'General',
      formatoExt: payload.fileName.split('.').pop(),
      driveUrl: fileUrl,
      driveFileId: fileId,
      tamanioBytes: payload.sizeBytes || 0,
      fechaSubida: now,
      usuarioSubida: userEmail
    }
  };
}

function recordHistory(idSolicitud, userEmail, modulo, origen, tipoAccion, valAnt, valNvo) {
  var sheet = getSheet('Historial');
  sheet.appendRow([
    generateUUID(),
    idSolicitud,
    new Date().toISOString(),
    userEmail,
    modulo,
    origen,
    tipoAccion,
    'Cambio',
    valAnt,
    valNvo
  ]);
}

function saveRequestTags(solicitudId, tagsArray) {
  var sheet = getSheet('SolicitudEtiquetas');
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][1] === solicitudId) {
      sheet.deleteRow(i + 1);
    }
  }
  tagsArray.forEach(function(tagId) {
    sheet.appendRow([generateUUID(), solicitudId, tagId]);
  });
}

function getSheetDataAsObjects(sheetName) {
  var sheet = getSheet(sheetName);
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var result = [];

  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    result.push(obj);
  }
  return result;
}

function getSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().toLowerCase() === sheetName.toLowerCase()) {
      return sheets[i];
    }
  }
  try {
    var sheet = ss.insertSheet(sheetName);
    initializeHeaders(sheet, sheetName);
    return sheet;
  } catch (e) {
    var s = ss.getSheetByName(sheetName);
    if (s) return s;
    throw e;
  }
}

function initializeHeaders(sheet, name) {
  var headers = [];
  if (name === 'Solicitudes') {
    headers = ['Id','Folio','Solicitud','AreaId','Tema','TipoId','IpDp','FechaEntrada','FechaVencimiento','FechaTermino','EstatusId','Observaciones','UsuarioCreacion','UltimaModificacion','Version','Eliminado'];
  } else if (name === 'SolicitudEtiquetas') {
    headers = ['Id','SolicitudId','EtiquetaId'];
  } else if (name === 'Historial') {
    headers = ['IdHistorial','IdSolicitud','FechaHora','Usuario','Modulo','Origen','TipoAccion','Campo','ValorAnterior','ValorNuevo'];
  } else if (name === 'Adjuntos') {
    headers = ['IdAdjunto','IdSolicitud','NombreArchivo','TipoDocumento','FormatoExt','DriveUrl','DriveFileId','TamanioBytes','FechaSubida','UsuarioSubida'];
  } else if (name === 'Usuarios') {
    headers = ['IdUsuario','Email','Nombre','FotoUrl','Permisos','UltimoAcceso','Activo'];
  } else if (name === 'Cat_Estatus') {
    headers = ['Id','Nombre','ColorHex','Orden'];
  } else if (name === 'Cat_ReglasVencimiento') {
    headers = ['Id','DiasUmbral','PrioridadNombre','ColorHex','MensajeAlerta','MostrarIcono','SobrescribirColor'];
  } else if (name === 'Cat_Areas') {
    headers = ['Id','Nombre','Responsable'];
    sheet.appendRow(headers);
    var initialAreas = [
      ['INGER', 'INGER', 'Dirección INGER'],
      ['CONASAMA', 'CONASAMA', 'Dirección CONASAMA'],
      ['DGRHO', 'DGRHO', 'Recursos Humanos'],
      ['UT SHARNY', 'UT SHARNY', 'Unidad Transparencia'],
      ['DGRMYNS', 'DGRMYNS', 'Materiales y Servicios'],
      ['CNEGSSR', 'CNEGSSR', 'CNEGSSR'],
      ['FINANZAS', 'Finanzas', 'Dirección Financiera'],
      ['JURIDICO', 'Jurídico', 'Dirección Jurídica'],
      ['GENERAL', 'General', 'Mesa General']
    ];
    initialAreas.forEach(function(a) { sheet.appendRow(a); });
    return;
  } else if (name === 'Cat_Tipos') {
    headers = ['Id','Nombre','Descripcion'];
  } else if (name === 'Cat_Etiquetas') {
    headers = ['Id','Nombre','ColorHex'];
  }

  if (headers.length > 0) {
    sheet.appendRow(headers);
  }
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
