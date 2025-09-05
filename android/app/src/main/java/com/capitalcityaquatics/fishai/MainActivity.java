package com.capitalcityaquatics.fishai;

import android.os.Bundle;
import android.view.View;

import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // This ensures the app's content is displayed behind the status and navigation bars.
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                        View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                        View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        );

        // This listener adjusts the padding of the root view to prevent content from being obscured by the system bars.
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(android.R.id.content), (v, insets) -> {
            int systemBars = WindowInsetsCompat.Type.systemBars();
            int top = insets.getInsets(systemBars).top;
            int bottom = insets.getInsets(systemBars).bottom;
            int left = insets.getInsets(systemBars).left;
            int right = insets.getInsets(systemBars).right;

            v.setPadding(left, top, right, bottom);
            return insets;
        });
    }
}