//
//  CDVBarcodeScanner.h
//  BarcodeScanner
//
//  Created by Jonathan Nunez Aguin on 30/09/2013.
//
//

#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>
#import "ZXingWidgetController.h"
#import "CaptureBarcodesViewController.h"

@interface CDVBarcodeScanner : CDVPlugin <ZXingDelegate, CaptureBarcodesDelegate>{

}

@property (nonatomic, copy) NSString* callbackId;

- (void)scan:(CDVInvokedUrlCommand*)command;

- (void)returnSuccess:(NSString*)scannedText format:(NSString*)format cancelled:(BOOL)cancelled;
- (void)returnError:(NSString*)message;

@end
