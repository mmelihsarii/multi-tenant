import { Component } from 'react';
import { showErrorToast } from './ToastProvider';

/**
 * Error Boundary Component
 * React component hatalarını yakalar ve kullanıcı dostu hata mesajı gösterir
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Bir sonraki render'da fallback UI göster
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Hata detaylarını logla
    console.error('Error Boundary yakaladı:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Toast notification göster
    showErrorToast('Bir hata oluştu. Sayfa yenileniyor...');

    // Production'da Sentry'ye gönder (kurulduğunda)
    // if (process.env.NODE_ENV === 'production') {
    //   Sentry.captureException(error, { contexts: { react: errorInfo } });
    // }

    // 3 saniye sonra sayfayı yenile
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: '#FAFAFA' }}
        >
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#FEE2E2' }}
            >
              <span className="material-symbols-outlined text-4xl" style={{ color: '#EF4444' }}>
                error
              </span>
            </div>

            {/* Error Message */}
            <h2 className="text-2xl font-bold mb-3" style={{ color: '#18181B' }}>
              Bir şeyler ters gitti
            </h2>

            <p className="text-base mb-6" style={{ color: '#71717A' }}>
              Üzgünüz, beklenmeyen bir hata oluştu. Sayfa otomatik olarak yenilenecek.
            </p>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary
                  className="cursor-pointer text-sm font-semibold mb-2"
                  style={{ color: '#F43F5E' }}
                >
                  Hata Detayları (Sadece Development)
                </summary>
                <div
                  className="p-4 rounded-lg text-xs font-mono overflow-auto max-h-48"
                  style={{
                    backgroundColor: '#18181B',
                    color: '#FAFAFA',
                  }}
                >
                  <p className="mb-2 font-bold" style={{ color: '#EF4444' }}>
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="whitespace-pre-wrap text-[10px]" style={{ color: '#A1A1AA' }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="h-12 px-6 rounded-full font-bold transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(to right, #F43F5E, #FB7185)',
                  color: '#FFFFFF',
                  boxShadow: '0 10px 25px -5px rgba(244, 63, 94, 0.2)',
                }}
              >
                Sayfayı Yenile
              </button>

              <button
                onClick={() => window.history.back()}
                className="h-12 px-6 rounded-full font-bold border-2 transition-all active:scale-95"
                style={{
                  borderColor: '#E4E4E7',
                  color: '#18181B',
                  backgroundColor: '#FFFFFF',
                }}
              >
                Geri Dön
              </button>
            </div>

            {/* Support Link */}
            <p className="text-xs mt-6" style={{ color: '#A1A1AA' }}>
              Sorun devam ederse{' '}
              <a
                href="mailto:support@eposcrm.com"
                className="font-semibold underline"
                style={{ color: '#F43F5E' }}
              >
                destek ekibiyle iletişime geçin
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
