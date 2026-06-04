#!/usr/bin/env python3
"""Launch a Ctool popup window using GTK + WebKit2."""
import sys
import gi
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit2', '4.1')
from gi.repository import Gtk, WebKit2


def main():
    if len(sys.argv) < 2:
        print("Usage: ctool_popup.py <url> [title] [icon_path]")
        sys.exit(1)

    url = sys.argv[1]
    title = sys.argv[2] if len(sys.argv) > 2 else "Ctool"

    win = Gtk.Window(title=title)
    win.set_default_size(900, 680)
    win.set_position(Gtk.WindowPosition.CENTER)

    try:
        icon_path = sys.argv[3] if len(sys.argv) > 3 else None
        if icon_path:
            win.set_icon_from_file(icon_path)
    except Exception:
        pass

    scrolled = Gtk.ScrolledWindow()
    scrolled.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)

    webview = WebKit2.WebView()
    webview.load_uri(url)
    scrolled.add(webview)

    win.add(scrolled)
    win.connect("destroy", Gtk.main_quit)
    win.show_all()

    Gtk.main()


if __name__ == "__main__":
    main()
