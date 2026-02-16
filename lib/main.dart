import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:http/http.dart' as http;
import 'dart:async';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter + React WebView',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Color(0xFF667eea),
          brightness: Brightness.light,
        ),
      ),
      home: WebViewScreen(),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  @override
  _WebViewScreenState createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  InAppWebViewController? webViewController;
  double progress = 0;
  bool isLoading = true;
  String? webUrl;
  bool useFallback = false;

  static const bool isDevelopmentMode = false;
  
  static const String PRODUCTION_URL = 'https://test-abs.tms.kg/';
  static const String FALLBACK_URL = 'file:///android_asset/flutter_assets/assets/web/index.html';

  @override
  void initState() {
    super.initState();
    _determineWebUrl();
  }

  Future<void> _determineWebUrl() async {
    if (isDevelopmentMode) {
      const devUrl = 'http://192.168.1.8:5173/';
      setState(() {
        webUrl = devUrl;
        useFallback = false;
      });
      if (kDebugMode) {
        print('🔧 Dev режим: загружаем с $devUrl');
        print('💡 Убедитесь, что dev сервер запущен: cd react-app && npm run dev');
      }
      return;
    }

    try {
      final response = await http
          .head(Uri.parse(PRODUCTION_URL))
          .timeout(const Duration(seconds: 5));
      
      if (response.statusCode == 200) {
        final timestamp = DateTime.now().millisecondsSinceEpoch;
        setState(() {
          webUrl = '$PRODUCTION_URL?v=$timestamp';
          useFallback = false;
        });
        if (kDebugMode) {
          print('✅ Production сервер доступен, загружаем с ${PRODUCTION_URL}');
        }
      } else {
        _useFallback();
      }
    } catch (e) {
      if (kDebugMode) {
        print('⚠️ Production сервер недоступен, используем локальную версию: $e');
      }
      _useFallback();
    }
  }

  Future<void> _reloadWebView() async {
    if (webViewController != null && !useFallback) {
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      await webViewController!.loadUrl(
        urlRequest: URLRequest(
          url: WebUri('$PRODUCTION_URL?v=$timestamp'),
        ),
      );
    }
  }

  void _useFallback() {
    setState(() {
      webUrl = FALLBACK_URL;
      useFallback = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (webUrl == null) {
      return Scaffold(
        backgroundColor: Color(0xFF0b1020), // Тёмный фон
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: Colors.white),
              SizedBox(height: 16),
              Text(
                'Проверка подключения...',
                style: TextStyle(color: Colors.white),
              ),
            ],
          ),
        ),
      );
    }

    return PopScope(
      canPop: false,
      onPopInvoked: (bool didPop) async {
        if (didPop) return;
        
        if (webViewController != null) {
          final canGoBack = await webViewController!.canGoBack();
          if (canGoBack) {
            await webViewController!.goBack();
            return;
          }
        }
        
        if (context.mounted) {
          Navigator.of(context).pop();
        }
      },
      child: Scaffold(
        body: Column(
        children: [
          if (useFallback)
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: Colors.orange.shade100,
              child: Row(
                children: [
                  Icon(Icons.wifi_off, size: 16, color: Colors.orange.shade800),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Оффлайн режим: используется локальная версия',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.orange.shade800,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          if (isLoading)
            LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(
                Theme.of(context).colorScheme.primary,
              ),
            ),

          Expanded(
            child: InAppWebView(
              initialUrlRequest: URLRequest(url: WebUri(webUrl!)),
              initialOptions: InAppWebViewGroupOptions(
                crossPlatform: InAppWebViewOptions(
                  javaScriptEnabled: true,
                  useShouldOverrideUrlLoading: true,
                  mediaPlaybackRequiresUserGesture: false,
                  allowFileAccessFromFileURLs: true,
                  allowUniversalAccessFromFileURLs: true,
                ),
                android: AndroidInAppWebViewOptions(
                  useHybridComposition: true,
                  domStorageEnabled: true,
                  allowContentAccess: true,
                  allowFileAccess: true,
                ),
                ios: IOSInAppWebViewOptions(
                  allowsInlineMediaPlayback: true,
                ),
              ),
              onWebViewCreated: (controller) {
                webViewController = controller;
              },
              onLoadStart: (controller, url) {
                setState(() {
                  isLoading = true;
                  progress = 0;
                });
              },
              onProgressChanged: (controller, progress) {
                setState(() {
                  this.progress = progress / 100;
                });
              },
              onLoadStop: (controller, url) async {
                setState(() {
                  isLoading = false;
                  progress = 1.0;
                });
                if (!useFallback && url.toString().startsWith('https://')) {
                  try {
                    await controller.clearCache();
                    if (kDebugMode) {
                      print(' Кеш WebView очищен для следующего обновления');
                    }
                  } catch (e) {
                    if (kDebugMode) {
                      print(' Ошибка при очистке кеша: $e');
                    }
                  }
                }
              },
              onLoadError: (controller, url, code, message) {
                if (kDebugMode) {
                  print(' Ошибка загрузки: $message (URL: $url)');
                }
                
                // Если ошибка при загрузке с dev сервера (localhost или IP)
                if (url.toString().contains(':5173')) {
                  if (kDebugMode) {
                    print(' Dev сервер недоступен, пробуем production URL');
                  }
                  final timestamp = DateTime.now().millisecondsSinceEpoch;
                  controller.loadUrl(
                    urlRequest: URLRequest(
                      url: WebUri('$PRODUCTION_URL?v=$timestamp'),
                    ),
                  );
                  return;
                }
                
                if (!useFallback && (url.toString().startsWith('https://') || url.toString().startsWith('http://'))) {
                  if (kDebugMode) {
                    print(' Ошибка загрузки с сервера, переключаемся на локальную версию');
                  }
                  _useFallback();
                  controller.loadUrl(urlRequest: URLRequest(url: WebUri(FALLBACK_URL)));
                }
              },
              onConsoleMessage: (controller, consoleMessage) {
                if (kDebugMode) {
                  print(' Console [${consoleMessage.messageLevel}]: ${consoleMessage.message}');
                }
              },
            ),
          ),
        ],
      ),
      ),
    );
  }
}
