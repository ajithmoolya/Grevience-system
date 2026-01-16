import ExpoModulesCore
import Foundation
import QuickLook

/*
* This module uses the QuickLook framework to display a preview of a file.
* See: https://developer.apple.com/documentation/quicklook/qlpreviewcontroller
*/
public final class ExpoFileViewerModule: Module {
  private var dataSource: FileUrlDataSource?
  private var previewController: QLPreviewController?
  private var previewControllerDelegate: PreviewControllerDelegate?

  public func definition() -> ModuleDefinition {
    Name("ExpoFileViewer")

    AsyncFunction("openFileAsync") { (uri: String, viewTag: Int?, promise: Promise) in
      guard let url = URL(string: uri) else {
        promise.reject("E_INVALID_URL", "Invalid file URL")
        return
      }
      guard
        let filePermissions: EXFilePermissionModuleInterface =
          appContext?.legacyModule(implementing: EXFilePermissionModuleInterface.self)
      else {
        throw FilePermissionModuleException()
      }

      let grantedPermissions = filePermissions.getPathPermissions(url.relativePath)
      guard grantedPermissions.rawValue >= EXFileSystemPermissionFlags.read.rawValue else {
        throw FilePermissionException()
      }

      if self.previewController == nil {
        self.previewController = QLPreviewController()
      }

      if let previewController = self.previewController {
        self.dataSource = FileUrlDataSource(fileURL: url)
        previewController.dataSource = self.dataSource

        guard let currentViewController = appContext?.utilities?.currentViewController() else {
          throw MissingCurrentViewControllerException()
        }

        let transitionView: UIView? =
          viewTag != nil
          ? appContext?.reactBridge?.uiManager.view(forReactTag: NSNumber(value: viewTag!)) : nil
        self.previewControllerDelegate = PreviewControllerDelegate(transitionView: transitionView)
        previewController.delegate = self.previewControllerDelegate

        if previewController.isBeingPresented {
          previewController.reloadData()
          promise.resolve(nil)
        } else {
          currentViewController.present(previewController, animated: true) {
            promise.resolve(nil)
          }
          previewController.refreshCurrentPreviewItem()
        }
      }
    }.runOnQueue(.main)
  }
}

class PreviewControllerDelegate: NSObject, QLPreviewControllerDelegate {
  private var transitionView: UIView?

  init(transitionView: UIView? = nil) {
    self.transitionView = transitionView
  }

  // required for swipe to dismiss in iOS 18
  // https://forums.developer.apple.com/forums/thread/762342
  func previewController(_ controller: QLPreviewController, transitionViewFor item: QLPreviewItem)
    -> UIView?
  {
    return transitionView ?? (controller.isBeingDismissed ? controller.view : nil)
  }
}

class FileUrlDataSource: NSObject, QLPreviewControllerDataSource {
  var fileURL: URL?

  init(fileURL: URL?) {
    self.fileURL = fileURL
  }

  func numberOfPreviewItems(in controller: QLPreviewController) -> Int {
    return self.fileURL != nil ? 1 : 0
  }

  func previewController(_ controller: QLPreviewController, previewItemAt index: Int)
    -> QLPreviewItem
  {
    return PreviewItem(withURL: self.fileURL ?? URL(fileURLWithPath: ""))
  }
}

class PreviewItem: NSObject, QLPreviewItem {
  var previewItemURL: URL?

  init(withURL url: URL) {
    self.previewItemURL = url
    super.init()
  }
}

internal class FilePermissionException: Exception {
  override var reason: String {
    "You don't have access to the provided file"
  }
}

internal class MissingCurrentViewControllerException: Exception {
  override var reason: String {
    "Cannot determine currently presented view controller"
  }
}

internal class UnsupportedTypeException: Exception {
  override var reason: String {
    "Could not share file since there were no apps registered for its type"
  }
}

internal class FilePermissionModuleException: Exception {
  override var reason: String {
    "File permission module not found"
  }
}
