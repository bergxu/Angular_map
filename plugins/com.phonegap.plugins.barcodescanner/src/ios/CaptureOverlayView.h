//
//  CaptureOverlayView.h
//  NXTransport
//
//  Created by Jonathan Nunez Aguin on 17/03/2014.
//
//

#import <UIKit/UIKit.h>

@protocol CaptureCancelDelegate;

@interface CaptureOverlayView : UIView

@property (nonatomic, weak) id<CaptureCancelDelegate> delegate;
@property (nonatomic, strong) NSMutableArray*  points;

- (void)setFoundMatchWithTopLeftPoint:(CGPoint)topLeftPoint topRightPoint:(CGPoint)topRightPoint bottomLeftPoint:(CGPoint)bottomLeftPoint bottomRightPoint:(CGPoint)bottomRightPoint;

- (void)reset;

@end

@protocol CaptureCancelDelegate
- (void)cancelled;
@end