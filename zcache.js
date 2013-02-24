/**
 * ZCache 
 * 
 * Plugin para carregamento e armazemento de arquivos Javascript em localStorage
 * baseado no Basket.js (http://addyosmani.github.com/basket.js)
 *
 * @license http://www.opensource.org/licenses/mit-license.php The MIT License
 * @author: Bruno Silva | eu@brunoziie.com 
 **/
(function (global) {
	'use strict';

	var options = {
			/**
			 * Modo debug
			 * @type {Boolean}
			 */
			debug : false,

			/**
			 * Tempo de duração do cache. (em segundos)
			 * @type {Integer}
			 */
			cacheDuration : 30 * 60,

			/**
			 * Caminho para o diretórios dos scripts
			 * @type {String}
			 */
			scriptsPath : ''
		},

		ZCache = {

			/**
			 * Armazena a fila de arquivos a serem carregados
			 * @type {Array}
			 */
			stack : [],

			/**
			 * Verifica se o navegador é compatível com o LocalStorage
			 * @return {Boolean} Verdadeiro caso compatível
			 */
			isCompatible : function () {
				if (typeof global.localStorage !== 'undefined') {
					this.isCompatible = function () {
						return true;
					};
				} else {
					this.isCompatible = function () {
						return false;
					};
				}
				return this.isCompatible();
			},

			/**
			 * Verifica se uma entrada do cache expirou
			 * @param  {Object}  file Entrada armazenada no cache
			 * @return {Boolean}      Verdadeiro caso tenha expirado
			 */
			isExpired : function (file) {
				if (typeof file.created !== 'undefined') {
					var currentDate = new Date(),
						expireDate = new Date(file.created);

					expireDate.setSeconds(expireDate.getSeconds() + options.cacheDuration);
					return (expireDate < currentDate) ? true : false;
				}

				return true;
			},

			/**
			 * Verifica se uma arquivos está salvo no cache
			 * @param  {String}  file Nome do arquivo
			 * @return {Boolean}      Verdadeiro caso o arquivo tenha uma entrada no cache
			 */
			hasCache : function (file) {
				if (this.isCompatible()) {
					this.hasCache = function (file) {
						return (global.localStorage.getItem(file) !== null) ? true : false;
					};
					return this.hasCache(file);
				} else {
					this.hasCache = function () {};
					return false;
				}
			},

			/**
			 * Adiciona uma entrada ao cache
			 * @param {Strinh} file    Nome do arquivo
			 * @param {String} content Conteúdo do arquivo
			 */
			addToCache : function (file, content) {
				if (this.isCompatible()) {
					this.addToCache = function (file, content) {
						global.localStorage.setItem(file, JSON.stringify(content));
					};

					this.addToCache(file, content);
				} else {
					this.addToCache = function () {};
				}
			},

			/**
			 * Pega um arquivo salvo no cache
			 * @param  {String} file Nome do arquivo
			 * @return {Object}      Retorna um objeto com o corpo do arquivo e a data de expiracão
			 */
			getFromCache : function (file) {
				return JSON.parse(global.localStorage.getItem(file));
			},

			/**
			 * Remove um arquivo do cache
			 * @param  {String} file Nome do arquivo
			 * @return {void}
			 */
			removeFromCache : function (file) {
				var path = options.scriptsPath + file;
				if (this.hasCache(path)) {
					global.localStorage.removeItem(path);
				}
			},

			/**
			 * Carrega um arquivo via XMLHttpRequest e armazena seu conteúdo em LocalStorage
			 * @param  {String}  path    Caminho do arquivo
			 * @param  {Boolean} nocache Define se o arquivo não será armezenado no LocalStorage
			 * @return {void}
			 */
			loadScriptText : function (path, nocache) {
				var that = this,
					xhr = new XMLHttpRequest(),
					useCache = nocache || true;

				xhr.open('GET', path);

				xhr.onreadystatechange = function () {
					if (xhr.readyState === 4) {
						if (xhr.status === 200) {
							if (useCache) {
								that.addToCache(path, {
									data : xhr.responseText,
									created : new Date()
								});
							}
						} else {
							if (options.debug === true) {
								console.log('"' + path + '"" not loaded');
							}
						}
					}
				};

				that.putInHead(path, true);
				xhr.send();
			},

			/**
			 * Adiciona uma requisicão a fila de carregamento
			 * @param {Object} fileData Dados do arquivo de script que será adicionado a fila de carregamento
			 * @return {void}
			 */
			putInStack : function (fileData) {
				this.stack.push(fileData);
			},

			/**
			 * Processa a fila de carregamendo de arquivos
			 * @param {Function} callback Função que deve ser executada após o processamento da fila
			 * @return {void}
			 */
			processStack : function (callback) {
				var that = this,
					current,
					script,
					content;

				if (this.stack.length > 0) {
					script = document.createElement('script');
					current = this.stack[0];
					content = current.content;
					this.stack.shift();

					if (current.viaSrc) {
						script.defer = true;
						script.src = content;
						script.onload = function () {
							that.processStack(callback);
						};
						global.document.head.appendChild(script);
					} else {
						script.text = content;
						global.document.head.appendChild(script);
						that.processStack(callback);
					}
				} else {
					callback = callback || function () {};
					callback();
				}
			},

			/**
			 * Adiciona um script ao head
			 * @param  {String}  content Conteudo do script ou caminho do arquivo
			 * @param  {Boolean} viaSrc  Define se o arquivo será carregado usando o atributo src da tag script
			 * @return {void}
			 */
			putInHead : function (content, viaSrc) {
				viaSrc = viaSrc || false;
				var data = {
						content : content,
						viaSrc : viaSrc
					};
				this.putInStack(data);
			}
		},

		API = {
			/**
			 * Requisita o(s) arquivo(s) de script
			 * @param  {Mixed}    path     String com o nome do arquivo ou Array com a lista de arquivos
			 * @param  {Integer}  noCache  Caso esteja carregando apenas um arquivo, define se o arquivo não será salvo no cache
			 * @param  {Function} callback Função que deve ser executada após o requisitar os arquivos
			 * @return {void}
			 */
			require : function (path, noCache, callback) {
				var i,
					ls,
					len,
					current,
					cached,
					interval,
					files = [];

				noCache = noCache || false;

				if (typeof path === 'string') {
					files.push(path);
				} else if (typeof path.length !== 'undefined') {
					files = path;
				}

				len = files.length;

				if (ZCache.isCompatible()) {
					for (i = 0; i < len; i += 1) {

						current = files[i];

						if (typeof current === 'object') {
							if (typeof current.noCache === 'boolean') {
								ZCache.putInHead(options.scriptsPath + current.file, current.noCache);
							} else {
								ZCache.putInHead(options.scriptsPath + current.file);
							}
						} else if (typeof current === 'string') {
							current = options.scriptsPath + current;

							if (noCache === true) {
								ZCache.putInHead(current, true);
							} else {
								if (ZCache.hasCache(current)) {
									cached = ZCache.getFromCache(current);

									if (!ZCache.isExpired(cached)) {
										ZCache.putInHead(cached.data);
									} else {
										ZCache.loadScriptText(current);
									}
								} else {
									ZCache.loadScriptText(current);
								}
							}
						}


					}
				} else {
					for (i = 0; i < len; i += 1) {
						current = files[i];

						if (typeof current === 'object') {
							ZCache.putInHead(options.scriptsPath + current.file);
						} else if (typeof current === 'string') {
							current = options.scriptsPath + current;
							ZCache.putInHead(current);
						}
					}
				}

				ZCache.processStack(callback);
			},

			/**
			 * Define o valor de uma opção
			 * @param {String} key   Nome da opção
			 * @param {Mixed}  value Valor da opção
			 */
			setOption : function (key, value) {
				options[key] = value;
			},

			/**
			 * Remove um arquivo do cache
			 * @param  {String} path Nome do arquivo
			 * @return {void}
			 */
			remove : function (path) {
				ZCache.removeFromCache(path);
			}
		};

	global.ZCache = API;
}(this));