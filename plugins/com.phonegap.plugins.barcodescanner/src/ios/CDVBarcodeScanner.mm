//
//  CDVBarcodeScanner.mm
//  BarcodeScanner
//
//  Created by Jonathan Nunez Aguin on 30/09/2013.
//
//

#import "CDVBarcodeScanner.h"

@implementation CDVBarcodeScanner

@synthesize callbackId = _callbackId;

- (UIViewController*) createScanner{
    if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 7.0f) {
        
        CaptureBarcodesViewController *captureController = [[CaptureBarcodesViewController alloc] init];
        captureController.delegate = self;
        captureController.soundToPlay = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"beep-beep" ofType:@"aiff"] isDirectory:NO];
        return captureController;
    }else{
     
        ZXingWidgetController *widgetController = [[ZXingWidgetController alloc] initWithDelegate:self showCancel:YES OneDMode:NO showLicense: NO];
        widgetController.soundToPlay = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"beep-beep" ofType:@"aiff"] isDirectory:NO];
        return widgetController;
    }
}

- (void)scan:(CDVInvokedUrlCommand*)command{
    
    self.callbackId = command.callbackId;
    
    [self.viewController presentModalViewController:[self createScanner] animated:YES];
}

- (void)returnSuccess:(NSString*)scannedText format:(NSString*)format cancelled:(BOOL)cancelled{
    
    NSNumber* cancelledNumber = [NSNumber numberWithInt:(cancelled?1:0)];
    
    NSMutableDictionary* resultDict = [[NSMutableDictionary alloc] init];
    [resultDict setObject:scannedText     forKey:@"text"];
    [resultDict setObject:format          forKey:@"format"];
    [resultDict setObject:cancelledNumber forKey:@"cancelled"];
    
    CDVPluginResult* result = [CDVPluginResult
                               resultWithStatus: CDVCommandStatus_OK
                               messageAsDictionary: resultDict
                               ];
    
    [self.commandDelegate sendPluginResult:result callbackId:self.callbackId];
}

- (void)returnError:(NSString*)message{
    
    CDVPluginResult* result = [CDVPluginResult
                               resultWithStatus: CDVCommandStatus_ERROR
                               messageAsString: message
                               ];
    
    [self.commandDelegate sendPluginResult:result callbackId:self.callbackId];
}

#pragma mark -
#pragma mark ZXingDelegate

- (void)zxingController:(ZXingWidgetController*)controller didScanResult:(NSString *)result format: (NSString*)format{

    [self.viewController dismissModalViewControllerAnimated: YES];
    
    [self returnSuccess:result format:format cancelled: NO];
}

- (void)zxingControllerDidCancel:(ZXingWidgetController*)controller{
    
    [self.viewController dismissModalViewControllerAnimated: YES];
    
    [self returnSuccess:@"" format:@"" cancelled: YES];
}

- (BOOL)zxingController:(ZXingWidgetController*)controller shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation{
 
    return [self.viewController shouldAutorotateToInterfaceOrientation: interfaceOrientation];
}

#pragma mark -
#pragma mark CaptureDelegate

- (void)captureController:(CaptureBarcodesViewController*)controller didScanResult:(NSString *)result format: (NSString*)format{
    
    controller.delegate = nil;
    
    [self.viewController dismissModalViewControllerAnimated: YES];
    
    [self returnSuccess:result format:format cancelled: NO];
}

- (void)captureControllerDidCancel:(CaptureBarcodesViewController*)controller{

    controller.delegate = nil;

    [self.viewController dismissModalViewControllerAnimated: YES];
    
    [self returnSuccess:@"" format:@"" cancelled: YES];
}

- (BOOL)captureController:(CaptureBarcodesViewController*)controller shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation{
     return [self.viewController shouldAutorotateToInterfaceOrientation: interfaceOrientation];
}

@end