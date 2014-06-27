//
//  CaptureBarcodesViewController.h
//  NXTransport
//
//  Created by Jonathan Nunez Aguin on 17/03/2014.
//
//

#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import "CaptureOverlayView.h"

@protocol CaptureBarcodesDelegate;

@interface CaptureBarcodesViewController : UIViewController<AVCaptureMetadataOutputObjectsDelegate>{
    AVCaptureSession *_session;
    AVCaptureDevice *_device;
    AVCaptureDeviceInput *_input;
    AVCaptureMetadataOutput *_output;
    AVCaptureVideoPreviewLayer *_prevLayer;
    
    SystemSoundID beepSound;
    NSURL *_soundToPlay;
    
    CaptureOverlayView *_highlightView;
}

@property (nonatomic, weak) id<CaptureBarcodesDelegate> delegate;
@property (nonatomic, strong) NSURL *soundToPlay;

- (void) setTourch:(BOOL) aStatus;

@end

@protocol CaptureBarcodesDelegate<NSObject>
- (void)captureController:(CaptureBarcodesViewController*)controller didScanResult:(NSString *)result format: (NSString*)format;
- (void)captureControllerDidCancel:(CaptureBarcodesViewController*)controller;

@optional
- (BOOL)captureController:(CaptureBarcodesViewController*)controller shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation;
@end