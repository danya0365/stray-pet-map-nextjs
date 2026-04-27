# Edit Profile Page Implementation

Create complete edit profile page following Clean Architecture pattern and matching existing profile page design.

## Plan

1. **Update IAuthRepository** - Add `updateProfile` method
2. **Update SupabaseAuthRepository** - Implement `updateProfile` using Supabase
3. **Update ApiAuthRepository** - Implement `updateProfile` calling API route
4. **Update ProfilePresenter** - Add `updateProfile` method
5. **Update useProfilePresenter** - Add `updateProfile` action to hook
6. **Create API route** `/api/profile/update` - Handle profile updates server-side
7. **Create EditProfileView** - UI component matching profile design
8. **Update page** `/profile/edit` - Server component for edit profile
