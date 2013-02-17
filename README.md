# ZCache

Plugin para carregamento e armazemento de arquivos Javascript em localStorage
baseado no [Basket.js](http://addyosmani.github.com/basket.js)

O **ZCache** é indicado para o carregamento de bibliotecas de terceiros em seu projeto.
Uma vez carregado o arquivo não será necessário fazer novamente o download do mesmo
na proxima vez que a pagina for recarregada, salvo quando o arquivo ultrapassar o
tempo de permanência no cache.

O ZCache é compativel com:
* Internet Explorer 8+
* Mozilla Firefox 16+
* Google Chrome 23+
* Safari 5.1+
* Android Browser 2.1+

Em navegadores sem suporte a localStorage os arquivos são incluidos, mas não
são salvos em cache.

---

#### Uso 
```
<script type="text/javascript" src="zcache.min.js"></script>
```

#### Exemplos

Incluindo um unico arquivo:

```javascript
ZCache.require('jquery.mim.js');
```

Incluindo um arquivo sem salvar no cache:

```javascript
ZCache.require('jquery.mim.js', true);
```

Incluindo multiplos arquivos

```javascript
ZCache.require(['myscript1.js', 'myscript2.js', 'myscript3.js']);
```

Incluindo multiplos arquivos sem salvar um determinado arquivo da lista no cache
```javascript
ZCache.require([{file : 'myscript1.js', noCache: true}, 'myscript2.js', 'myscript3.js']);
```



#### Opções

Para definir uma opção usa-se o metódo setOption
```javascript
ZCache.setOption('cacheDuration', 3600);
```

##### debug
Quando **true** exibe mensagens no console em caso de erro. **(default: false)**

##### cacheDuration
Define (em segundos) a duração de um arquivo em no cache **(default: 1800 segundos)**

##### scriptsPath
Define o caminho para o diretório onde estão armazenados os arquivos javascript **(default: vazio)**

OBS: Caso use arquivos em muitos diretórios destintos aconselha-se não alterar essa opção




## License
(c) 2013 - Bruno Silva | eu@brunoziie.com 

[MIT License](http://en.wikipedia.org/wiki/MIT_License)