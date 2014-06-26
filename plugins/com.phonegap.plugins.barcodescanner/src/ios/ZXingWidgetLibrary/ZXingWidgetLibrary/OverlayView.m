// -*- Mode: ObjC; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-

/**
 * Copyright 2009 Jeff Verkoeyen
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import "OverlayView.h"

static const int MIN_FRAME_WIDTH = 240;
static const int MIN_FRAME_HEIGHT = 240;
static const int MAX_FRAME_WIDTH = 1200; // = 5/8 * 1920
static const int MAX_FRAME_HEIGHT = 675; // = 5/8 * 1080

@interface OverlayView()
@property (nonatomic,retain) UILabel *instructionsLabel;
@end


@implementation OverlayView

@synthesize delegate, oneDMode;
@synthesize points = _points;
@synthesize instructionsLabel;
@synthesize displayedMessage;
@synthesize cancelEnabled;

////////////////////////////////////////////////////////////////////////////////////////////////////
- (id)initWithFrame:(CGRect)theFrame cancelEnabled:(BOOL)isCancelEnabled oneDMode:(BOOL)isOneDModeEnabled {
    return [self initWithFrame:theFrame cancelEnabled:isCancelEnabled oneDMode:isOneDModeEnabled showLicense:YES];
}

- (id) initWithFrame:(CGRect)theFrame cancelEnabled:(BOOL)isCancelEnabled oneDMode:(BOOL)isOneDModeEnabled showLicense:(BOOL)showLicenseButton {
    self = [super initWithFrame:theFrame];
    if( self ) {
        self.opaque = NO;
        self.backgroundColor = [UIColor clearColor];
        self.autoresizingMask = UIViewAutoresizingFlexibleLeftMargin | UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleRightMargin | UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleBottomMargin;
        self.clipsToBounds = YES;
        
        self.oneDMode = isOneDModeEnabled;
        
        toolbar = [[UIToolbar alloc] initWithFrame: CGRectZero];
        toolbar.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleBottomMargin;
        toolbar.barStyle = UIBarStyleBlackTranslucent;
        toolbar.translucent = YES;
        
        NSMutableArray *items = [NSMutableArray arrayWithCapacity: 1];
        
        if (showLicenseButton) {
            
            UIButton *licenseButton = [UIButton buttonWithType:UIButtonTypeInfoLight];
            UIBarButtonItem *licenseBarButton = [[UIBarButtonItem alloc] initWithCustomView: licenseButton];
            
            [items addObject: licenseBarButton];
            [licenseBarButton release];
        }
        
        self.cancelEnabled = isCancelEnabled;
        
        if (self.cancelEnabled) {
            
            UIBarButtonItem *cancelButton = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemCancel target:self action:@selector(cancel:) ];
            
            [items addObject: cancelButton];
            [cancelButton release];
        }
        
        [toolbar setItems:items animated:NO];
        
        [toolbar sizeToFit];
        CGFloat toolbarHeight  = [toolbar frame].size.height;
        CGFloat rootViewHeight = CGRectGetHeight(self.bounds);
        CGFloat rootViewWidth  = CGRectGetWidth(self.bounds);
        CGRect  rectArea       = CGRectMake(0, rootViewHeight - toolbarHeight, rootViewWidth, toolbarHeight);
        
        [toolbar setFrame:rectArea];
        
        [self addSubview: toolbar];
        
    }
    return self;
}

- (void)cancel:(id)sender {
	// call delegate to cancel this scanner
	if (delegate != nil) {
		[delegate cancelled];
	}
}

- (void)showLicenseAlert:(id)sender {
    NSString *title =
    NSLocalizedStringWithDefaultValue(@"OverlayView license alert title", nil, [NSBundle mainBundle], @"License", @"License");
    
    NSString *message =
    NSLocalizedStringWithDefaultValue(@"OverlayView license alert message", nil, [NSBundle mainBundle], @"Scanning functionality provided by ZXing library, licensed under Apache 2.0 license.", @"Scanning functionality provided by ZXing library, licensed under Apache 2.0 license.");
    
    NSString *cancelTitle =
    NSLocalizedStringWithDefaultValue(@"OverlayView license alert cancel title", nil, [NSBundle mainBundle], @"OK", @"OK");
    
    NSString *viewTitle =
    NSLocalizedStringWithDefaultValue(@"OverlayView license alert view title", nil, [NSBundle mainBundle], @"View License", @"View License");
    
    UIAlertView *av =
    [[UIAlertView alloc] initWithTitle:title message:message delegate:self cancelButtonTitle:cancelTitle otherButtonTitles:viewTitle, nil];
    
    [av show];
    [self retain]; // For the delegate callback ...
    [av release];
}

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex {
    if (buttonIndex == [alertView firstOtherButtonIndex]) {
        [[UIApplication sharedApplication] openURL:[NSURL URLWithString:@"http://www.apache.org/licenses/LICENSE-2.0.html"]];
    }
    [self release];
}

////////////////////////////////////////////////////////////////////////////////////////////////////
- (void) dealloc {
	[_points release], _points = nil;
    [instructionsLabel release], instructionsLabel = nil;
    [displayedMessage release], displayedMessage = nil;
    [toolbar release], toolbar = nil;
	[super dealloc];
}


- (void)drawRect:(CGRect)rect inContext:(CGContextRef)context {
	CGContextBeginPath(context);
	CGContextMoveToPoint(context, rect.origin.x, rect.origin.y);
	CGContextAddLineToPoint(context, rect.origin.x + rect.size.width, rect.origin.y);
	CGContextAddLineToPoint(context, rect.origin.x + rect.size.width, rect.origin.y + rect.size.height);
	CGContextAddLineToPoint(context, rect.origin.x, rect.origin.y + rect.size.height);
	CGContextAddLineToPoint(context, rect.origin.x, rect.origin.y);
	CGContextStrokePath(context);
}

-(int) findDesiredDimensionInRangeFor: (int) resolution min:(int) hardMin max: (int) hardMax {
    int dim = 5 * resolution / 8; // Target 5/8 of each dimension
    if (dim < hardMin) {
        return hardMin;
    }
    if (dim > hardMax) {
        return hardMax;
    }
    return dim;
}

-(CGRect) cropRect{
    
    CGSize screenResolution = self.bounds.size;
    
    int width = [self findDesiredDimensionInRangeFor:screenResolution.width min:MIN_FRAME_WIDTH max:MAX_FRAME_WIDTH];
    int height = [self findDesiredDimensionInRangeFor:screenResolution.height min:MIN_FRAME_HEIGHT max:MAX_FRAME_HEIGHT];
    
    int leftOffset = (screenResolution.width - width) / 2;
    int topOffset = (screenResolution.height - height) / 2;
    
    CGRect framingRect = CGRectMake(leftOffset, topOffset, width, height);
    
    return framingRect;
    
    /*
    CGFloat rectSize = self.frame.size.width - kPadding * 2;
    
    if (!oneDMode) {
        return framingRect;
    } else {
        CGFloat rectSize2 = self.bounds.size.height - kPadding * 2;
        return CGRectMake(kPadding, kPadding, rectSize, rectSize2);
    }
     */
}

- (CGPoint)map:(CGPoint)point {
    CGPoint center;
    center.x = [self cropRect].size.width/2;
    center.y = [self cropRect].size.height/2;
    float x = point.x - center.x;
    float y = point.y - center.y;
    int rotation = 90;
    switch(rotation) {
        case 0:
            point.x = x;
            point.y = y;
            break;
        case 90:
            point.x = -y;
            point.y = x;
            break;
        case 180:
            point.x = -x;
            point.y = -y;
            break;
        case 270:
            point.x = y;
            point.y = -x;
            break;
    }
    point.x = point.x + center.x;
    point.y = point.y + center.y;
    return point;
}

#define kTextMargin 10

////////////////////////////////////////////////////////////////////////////////////////////////////
- (void)drawRect:(CGRect)rect {
	[super drawRect:rect];
    
    if (displayedMessage == nil) {
        self.displayedMessage = NSLocalizedStringWithDefaultValue(@"OverlayView displayed message", nil, [NSBundle mainBundle], @"Place a barcode inside the viewfinder rectangle to scan it.", @"Place a barcode inside the viewfinder rectangle to scan it.");
    }
	CGContextRef c = UIGraphicsGetCurrentContext();
    
	CGFloat white[4] = {1.0f, 1.0f, 1.0f, 1.0f};
	CGContextSetStrokeColor(c, white);
	CGContextSetFillColor(c, white);
	[self drawRect:[self cropRect] inContext:c];
	
    //	CGContextSetStrokeColor(c, white);
	//	CGContextSetStrokeColor(c, white);
	CGContextSaveGState(c);
    
    NSString *message = self.displayedMessage;
	if (oneDMode) {
        message = NSLocalizedStringWithDefaultValue(@"OverlayView 1d instructions", nil, [NSBundle mainBundle], @"Place a red line over the bar code to be scanned.", @"Place a red line over the bar code to be scanned.");
	}
    
    UIFont *font = [UIFont systemFontOfSize:15];
    CGSize constraint = CGSizeMake(rect.size.width  - 2 * kTextMargin, [self cropRect].origin.y);
    CGSize displaySize = [message sizeWithFont:font constrainedToSize:constraint];
    CGRect displayRect = CGRectMake((rect.size.width - displaySize.width) / 2 , [self cropRect].origin.y - displaySize.height, displaySize.width, displaySize.height);
    [message drawInRect:displayRect withFont:font lineBreakMode:NSLineBreakByWordWrapping alignment:NSTextAlignmentCenter];
    
	CGContextRestoreGState(c);
	int offset = rect.size.height / 2;
	if (oneDMode) {
		CGFloat red[4] = {1.0f, 0.0f, 0.0f, 1.0f};
		CGContextSetStrokeColor(c, red);
		CGContextSetFillColor(c, red);
		CGContextBeginPath(c);
		//		CGContextMoveToPoint(c, rect.origin.x + kPadding, rect.origin.y + offset);
		//		CGContextAddLineToPoint(c, rect.origin.x + rect.size.width - kPadding, rect.origin.y + offset);
		CGContextMoveToPoint(c, rect.origin.x, rect.origin.y + offset);
		CGContextAddLineToPoint(c, rect.origin.x + rect.size.width, rect.origin.y + offset);
		CGContextStrokePath(c);
	}
	if( [self.points count] > 0 ) {
		CGFloat red[4] = {1.0f, 0.0f, 0.0f, 1.0f};
		CGContextSetStrokeColor(c, red);
		CGContextSetFillColor(c, red);
		if (oneDMode && [self.points count] > 1) {
			CGPoint val1 = [self map:[[self.points objectAtIndex:0] CGPointValue]];
			CGPoint val2 = [self map:[[self.points objectAtIndex:1] CGPointValue]];
			CGContextMoveToPoint(c, offset, val1.x);
			CGContextAddLineToPoint(c, offset, val2.x);
			CGContextStrokePath(c);
		}
		else {
			CGRect smallSquare = CGRectMake(0, 0, 10, 10);
			for( NSValue* value in self.points ) {
				CGPoint point = [self map:[value CGPointValue]];
				smallSquare.origin = CGPointMake(
                                                 [self cropRect].origin.x + point.x - smallSquare.size.width / 2,
                                                 [self cropRect].origin.y + point.y - smallSquare.size.height / 2);
				[self drawRect:smallSquare inContext:c];
			}
		}
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////
- (NSMutableArray*)  points{
    if (!_points){
        _points = [[NSMutableArray alloc] init];
    }
    return _points;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
- (void) setPoints:(NSMutableArray*)pnts {
    
    [self.points removeAllObjects];
	
    if (pnts != nil) {        
        [self.points addObjectsFromArray: pnts];
        self.backgroundColor = [UIColor colorWithWhite:1.0 alpha:0.25];
    }
    [self setNeedsDisplay];
}

- (void) setPoint:(CGPoint)point {
    
    if (self.points.count > 20) {
        [self.points removeObjectAtIndex:0];
    }
    [self.points addObject:[NSValue valueWithCGPoint:point]];
    [self setNeedsDisplay];
}

@end
