// Prevents additional console window on Windows in release.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Workaround for WebKitGTK DMABUF renderer crashes on Wayland
    // (observed on Fedora 43 + webkit2gtk-4.1 2.52.1): the process aborts with
    // "Error 71 (Protocol error) dispatching to Wayland display" at startup.
    #[cfg(target_os = "linux")]
    {
        if std::env::var_os("WEBKIT_DISABLE_DMABUF_RENDERER").is_none() {
            std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
        }
    }

    budget_tracker_lib::run()
}
