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

  static const bool isDevelopmentMode = true;
  
  // URL вашего сервера
  static const String PRODUCTION_URL = 'https://test-abs.tms.kg/';
  // Fallback на локальную версию
  static const String FALLBACK_URL = 'file:///android_asset/flutter_assets/assets/web/index.html';

  @override
  void initState() {
    super.initState();
    _determineWebUrl();
  }

  Future<void> _determineWebUrl() async {
    if (kDebugMode && isDevelopmentMode) {
      // Development: всегда локальный dev server
      setState(() {
        webUrl = 'http://192.168.1.168:5173';
      });
      return;
    }

    // Production: проверяем доступность сервера
    try {
      final response = await http
          .head(Uri.parse(PRODUCTION_URL))
          .timeout(const Duration(seconds: 3));
      
      if (response.statusCode == 200) {
        // Сервер доступен - используем его
        setState(() {
          webUrl = PRODUCTION_URL;
          useFallback = false;
        });
        if (kDebugMode) {
          print('✅ Сервер доступен, загружаем с ${PRODUCTION_URL}');
        }
      } else {
        // Сервер вернул ошибку - используем fallback
        _useFallback();
      }
    } catch (e) {
      // Ошибка подключения - используем fallback
      if (kDebugMode) {
        print('⚠️ Сервер недоступен, используем локальную версию: $e');
      }
      _useFallback();
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
    // Показываем загрузку, пока определяем URL
    if (webUrl == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text('Проверка подключения...'),
            ],
          ),
        ),
      );
    }

    return Scaffold(
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
              onLoadStop: (controller, url) {
                setState(() {
                  isLoading = false;
                  progress = 1.0;
                });
              },
              onLoadError: (controller, url, code, message) {
                print('❌ Ошибка загрузки: $message');
                
                // Если ошибка при загрузке с сервера - переключаемся на fallback
                if (!useFallback && url.toString().startsWith('https://')) {
                  if (kDebugMode) {
                    print('⚠️ Ошибка загрузки с сервера, переключаемся на локальную версию');
                  }
                  _useFallback();
                  // Перезагружаем с локальной версией
                  controller.loadUrl(urlRequest: URLRequest(url: WebUri(FALLBACK_URL)));
                }
              },
              onConsoleMessage: (controller, consoleMessage) {
                if (kDebugMode) {
                  print('🖥️ Console [${consoleMessage.messageLevel}]: ${consoleMessage.message}');
                }
              },
            ),
          ),
        ],
      ),
    );
  }
}
